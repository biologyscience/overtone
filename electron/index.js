const { app, BrowserWindow, ipcMain, shell, Menu, clipboard, nativeImage, Tray, protocol, net } = require('electron');
const metadata = require('music-metadata'); // cannot write and cannot read genre properly
const taglib = require('node-taglib-sharp'); // cannot read artists properly
const { mkdirSync, existsSync, writeFileSync, statSync } = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Vibrant } = require('node-vibrant/node');

if (!existsSync(path.join(__dirname, './appdata/'))) mkdirSync(path.join(__dirname, './appdata/'));
if (!existsSync(path.join(__dirname, './appdata/webp'))) mkdirSync(path.join(__dirname, './appdata/webp'));

['config', 'queues', 'songList', 'albums', 'songMetadata'].forEach((x) =>
{
    const filepath = path.join(__dirname, `./appdata/${x}.json`);

    let data = {};

    if (existsSync(filepath)) return;

    if (x === 'config')
    {
        data =
        {
            allowedMusicFileFormats: ['mp3', 'wav', 'ogg', 'flac'],
            launchOnStartup: false,
            systemTray: false,
            checkMusicIn: [],
            lastQueueState: {},
            "spotify": {
                "clientID": "",
                "clientSecret": ""
            },
            colors:
            {
                dynamic: true,
                highContrast: false,
                theme: 'Dark',
                themes: {}
            },
            audio:
            {
                device: 'default',
                speed: 1,
                preservePitch: false,
                crossFade: 250,
                volume: 100,
                shuffle: false,
                repeat: false,
                autoPlayOnLaunch: false,
                percentForPlaycount: 50
            },
            eq:
            {
                show: true,
                timeDomain: true,
                enabled: false,
                preset: 'Soft Rock'
            },
            interface:
            {
                font: 'Default (Fira Sans)',
                scale: 1,
                animations: true
            },
            discordRPC:
            {
                appID: '1312407617540456458',
                autoConnect: true
            }
        };
    }

    if (x === 'queues') data = [];

    writeFileSync(filepath, JSON.stringify(data, null, 4));
});

protocol.registerSchemesAsPrivileged([{
    scheme: 'overtone',
    privileges: { standard: true }
}]);

const { appdata, parseTime } = require('./util');

const audioPlayer = require('./player');
require('./rpc');
require('./sections/albums');
require('./sections/artists');
require('./sections/eqs');
require('./sections/folders');
require('./sections/queues');
require('./sections/settings');

let WINDOW = null;
let TRAY = null; 

function exitApp({currentTime})
{
    const config = appdata.get('config');

    config.lastQueueState.duration = currentTime;

    appdata.set('config', config);

    WINDOW.close();
}

function wantQueue(queue)
{
    const queues = appdata.get('queues');

    const songMetadata = appdata.get('songMetadata');

    const { songs, currentSong } = queues.find(x => x.name === queue);

    const songList = songs.map((filepath) =>
    {
        const { title, artists, album, duration, rawDuration } = songMetadata[filepath];

        return { title, artists, album, duration, rawDuration, filepath };
    });
    
    let totalTime = 0; songList.forEach(({rawDuration}) => totalTime += rawDuration);

    return { queueName: queue, songs: songList, trackNumber: currentSong, duration: parseTime(totalTime).text };
}

ipcMain.on('ipc-clientReady', (E) =>
{
    const config = appdata.get('config');

    WINDOW.webContents.send('ipc-takeConfig', config);

    const { lastQueueState, audio } = config;
    const queues = appdata.get('queues');

    if (lastQueueState.queue?.length > 0)
    {
        const queue = queues.find(x => x.name === lastQueueState.queue);

        WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(queue.name));
        WINDOW.webContents.send('ipc-restoreVolume', audio.volume);
        WINDOW.webContents.send('ipc-restoreShuffleRepeat', {shuffle: audio.shuffle, repeat: audio.repeat});
        WINDOW.webContents.send('ipc-restoreCurrentTime', lastQueueState.duration);

        audioPlayer.shuffle = audio.shuffle;
        audioPlayer.repeat = audio.repeat;
        audioPlayer.setQueue(queue.songs, lastQueueState.track, queue.name).setNowPlaying(queue.songs[lastQueueState.track], audio.autoPlayOnLaunch);
    }
});

ipcMain.on('ipc-songPlayed', (E, filepath) =>
{
    const songMetadata = appdata.get('songMetadata');

    if (songMetadata[filepath] === undefined) return;

    const { playCount } = songMetadata[filepath];

    if (playCount === undefined) songMetadata[filepath].playCount = 0;
    
    songMetadata[filepath].playCount++;

    appdata.set('songMetadata', songMetadata);
});

ipcMain.handle('ipc-wantInfo', async (E, filepath) =>
{    
    const { format, common } = await metadata.parseFile(filepath);

    const picture = common.picture[0];
    const { playCount, isFavorite } = appdata.get('songMetadata')[filepath];

    format.size = statSync(filepath).size;
    common.picture = `data:${picture.format};base64,${picture.data.toString('base64')}`;

    const data =
    {
        file: format,
        tags: common,

        extras:
        {
            filepath,
            playCount,
            isFavorite
        }
    };

    data.tags.label = data.tags.label?.[0]

    if (picture?.data)
    {
        const colors = await Vibrant.from(picture.data).getPalette();
        for (const key in colors) colors[key] = colors[key]._rgb.map(x => parseFloat(x.toFixed(3)));

        data.extras.colors = colors;
    }

    return data;
});

ipcMain.on('ipc-newWindow', (E, url) =>
{
    const imgWindow = new BrowserWindow({ width: 720, height: 720 });

    imgWindow.webContents.on('context-menu', (E, {mediaType, srcURL}) =>
    {
        const menuTemplate = [];

        if (mediaType === 'image')
        {
            menuTemplate.push({
                label: 'Save image as...',
                click: () => imgWindow.webContents.downloadURL(srcURL)
            });

            menuTemplate.push({
                label: 'Copy image',
                click: () => clipboard.writeImage(nativeImage.createFromDataURL(srcURL))
            });
        }

        Menu.buildFromTemplate(menuTemplate).popup();
    });

    let zoom = 0;

    imgWindow.webContents.on('zoom-changed', (E, direction) =>
    {
        if (direction === 'in') zoom++;
        if (direction === 'out') zoom--;

        imgWindow.webContents.setZoomLevel(zoom);
    });

    imgWindow.removeMenu();
    imgWindow.loadURL(url).then(() => imgWindow.webContents.setZoomLevel(zoom));
});

ipcMain.on('ipc-openInBrowser', (E, url) => shell.openExternal(url));

ipcMain.on('ipc-editTags', (E, {file, tags, toastEvent}) =>
{
    const songMetadata = appdata.get('songMetadata');
    const song = taglib.File.createFromPath(file);
    
    tags.artists = tags.artists.filter(x => x.length > 0);
    tags.genre = tags.genre.filter(x => x.length > 0);

    if (tags.title?.length > 0)
    {
        songMetadata[file].title = tags.title;
        song.tag.title = tags.title;
    }

    if (tags.album?.length > 0)
    {
        songMetadata[file].album = tags.album;
        song.tag.album = tags.album;
    }

    if (tags.artists[0] !== undefined)
    {
        songMetadata[file].artists = tags.artists;
        song.tag.performers = tags.artists;
    }

    if (tags.albumartist?.length) song.tag.albumArtists = [tags.albumartist];
    
    if (tags.genre[0] !== undefined)
    {
        songMetadata[file].genre = tags.genre;
        song.tag.genres = tags.genre;
    }

    if (tags.label?.length > 0) song.tag.publisher = tags.label;

    if (tags.bpm?.length > 0)
    {
        const bpm = parseInt(tags.bpm);
        if (!isNaN(bpm)) song.tag.beatsPerMinute = bpm;
    }
    
    if (tags?.track?.no?.toString()?.length > 0)
    {
        const track = parseInt(tags.track.no);

        if (!isNaN(track))
        {
            songMetadata[file].track.no = track;
            song.tag.track = track;
        }
    }

    if (tags.year?.length > 0)
    {
        const year = parseInt(tags.year);

        if (!isNaN(year))
        {
            songMetadata[file].year = year;
            song.tag.year = year;
        }
    }

    if (tags.picture?.length > 0)
    {
        const split = tags.picture.match(/^data:(.+?)(;base64)?,(.*)$/);

        if (split !== null)
        {
            const buf = Buffer.from(split[3], 'base64');

            sharp(buf).webp({quality: 70}).toFile(path.join(__dirname, `./appdata/webp/${songMetadata[file].albumID}.webp`));
            
            song.tag.pictures[0].mimeType = split[1];
            song.tag.pictures[0].data = new Uint8Array(buf);
        }        
    }

    appdata.set('songMetadata', songMetadata);
    song.save();
    song.dispose();

    if (audioPlayer.queue[audioPlayer.currentQueueItem] === file) audioPlayer.setNowPlaying(file, false, songMetadata);

    WINDOW.webContents.send(toastEvent, {type: 'success', text: `Metatags for were changed successfully`});
});

ipcMain.on('ipc-minimize', () => WINDOW.minimize());

ipcMain.on('ipc-maximize', () => WINDOW.maximize());

ipcMain.on('ipc-close', (E, data) =>
{
    const { systemTray } = appdata.get('config');

    if (!systemTray) return exitApp(data);

    WINDOW.hide();
});

app.on('ready', () =>
{
    WINDOW = new BrowserWindow
    ({
        minWidth: 500,
        width: 500,
        minHeight: 500,
        height: 500,
        frame: false,
        title: 'OverTone',
        icon: path.join(__dirname, 'logo.png'),
        webPreferences:
        {
            webSecurity: false,
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    /**
     * AUDIO SERVED IN PROTOCOL IS MEH
     * HENCE KEEP WEB SECURITY FALSE
     */

    ipcMain.emit('WINDOW_OBJECT', WINDOW);

    TRAY = new Tray(path.join(__dirname, 'logo.png'));
    TRAY.setToolTip('OverTone');
    TRAY.setContextMenu(Menu.buildFromTemplate([{ label: 'Quit OverTone', click: () => WINDOW.close() }]));
    TRAY.on('click', () => WINDOW.show());

    protocol.handle('overtone', (request) => 
    {
        const filepath = request.url.slice('overtone://'.length);

        if (filepath.startsWith('undefined')) return;
        if (filepath.startsWith('http')) return net.fetch(filepath.replace('//', '://'));

        const driveLetter = filepath.at(0);

        return net.fetch(`file:///${driveLetter.toUpperCase()}:${filepath.slice(1)}`);
    });

    if (process.argv.includes('--dev')) WINDOW.loadURL('http://localhost:8520');
    else WINDOW.loadFile(path.join(__dirname, '../react/dist/index.html'));
});