const { app, BrowserWindow, ipcMain, shell, Menu, clipboard, nativeImage, Tray, protocol, net } = require('electron');
const metadata = require('music-metadata'); // cannot write and cannot read genre properly
const taglib = require('node-taglib-sharp'); // cannot read artists properly
const { mkdirSync, existsSync, statSync } = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Vibrant } = require('node-vibrant/node');
const { default: Store } = require('electron-store');

const albums = new Store();
const config = new Store();
const eqs = new Store({accessPropertiesByDotNotation: false});
const queues = new Store({accessPropertiesByDotNotation: false});
const songList = new Store({accessPropertiesByDotNotation: false})
const songMetadata = new Store({accessPropertiesByDotNotation: false});

albums.path = path.join(__dirname, './appdata/albums.json');
config.path = path.join(__dirname, './appdata/config.json');
eqs.path = path.join(__dirname, './appdata/eqs.json');
queues.path = path.join(__dirname, './appdata/queues.json');
songList.path = path.join(__dirname, './appdata/songList.json');
songMetadata.path = path.join(__dirname, './appdata/songMetadata.json');

if (!existsSync(path.join(__dirname, './appdata/'))) mkdirSync(path.join(__dirname, './appdata/'));
if (!existsSync(path.join(__dirname, './appdata/webp'))) mkdirSync(path.join(__dirname, './appdata/webp'));

if (!existsSync(path.join(__dirname, './appdata/config.json')))
{
    config.store =
    {
        allowedMusicFileFormats: ['mp3', 'wav', 'ogg', 'flac'],
        launchOnStartup: false,
        systemTray: false,
        checkMusicIn: [],
        lastQueueState: {},
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
            animations: true,
            shake: false
        },
        discordRPC:
        {
            appID: '1312407617540456458',
            autoConnect: true
        }
    };
}

protocol.registerSchemesAsPrivileged([{
    scheme: 'overtone',
    privileges: { standard: true }
}]);

const { parseTime } = require('./util');

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
    config.set('lastQueueState.duration', currentTime);

    WINDOW.close();
}

function wantQueue(queue)
{
    const { songs, currentSong } = queues.get(queue);

    const data = { ...songMetadata.store };

    const songList = songs.map((filepath) =>
    {
        const { title, artists, album, duration, rawDuration } = data[filepath];

        return { title, artists, album, duration, rawDuration, filepath };
    });
    
    let totalTime = 0; songList.forEach(({rawDuration}) => totalTime += rawDuration);

    return { queueName: queue, songs: songList, trackNumber: currentSong, duration: parseTime(totalTime).text };
}

ipcMain.on('ipc-clientReady', (E) =>
{
    WINDOW.webContents.send('ipc-takeConfig', config.store);

    const { lastQueueState, audio } = config.store;

    if (lastQueueState.queue?.length > 0)
    {
        const queue = queues.get(lastQueueState.queue);

        WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(lastQueueState.queue));
        WINDOW.webContents.send('ipc-restoreVolume', audio.volume);
        WINDOW.webContents.send('ipc-restoreShuffleRepeat', {shuffle: audio.shuffle, repeat: audio.repeat});
        WINDOW.webContents.send('ipc-restoreCurrentTime', lastQueueState.duration);

        audioPlayer.shuffle = audio.shuffle;
        audioPlayer.repeat = audio.repeat;
        audioPlayer.setQueue(queue.songs, lastQueueState.track, lastQueueState.queue).setNowPlaying(queue.songs[lastQueueState.track], audio.autoPlayOnLaunch);
    }
});

ipcMain.on('ipc-songPlayed', (E, filepath) =>
{
    if (songMetadata.get(filepath) === undefined) return;

    const tempMetadata = songMetadata.get(filepath);

    if (tempMetadata.playCount === undefined) tempMetadata.playCount = 0;
    tempMetadata.playCount++;

    songMetadata.set(filepath, tempMetadata);
});

ipcMain.handle('ipc-wantInfo', async (E, filepath) =>
{    
    const { format, common } = await metadata.parseFile(filepath);

    const picture = common.picture[0];
    const { playCount, isFavorite } = songMetadata.get(filepath);

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
    const tempMetadata = songMetadata.get(file);
    const song = taglib.File.createFromPath(file);
    
    tags.artists = tags.artists.filter(x => x.length > 0);
    tags.genre = tags.genre.filter(x => x.length > 0);

    if (tags.title?.length > 0)
    {
        tempMetadata.title = tags.title;
        song.tag.title = tags.title;
    }

    if (tags.album?.length > 0)
    {
        tempMetadata.album = tags.album;
        song.tag.album = tags.album;
    }

    if (tags.artists[0] !== undefined)
    {
        tempMetadata.artists = tags.artists;
        song.tag.performers = tags.artists;
    }

    if (tags.albumartist?.length) song.tag.albumArtists = [tags.albumartist];
    
    if (tags.genre[0] !== undefined)
    {
        tempMetadata.genre = tags.genre;
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
            tempMetadata.track.no = track;
            song.tag.track = track;
        }
    }

    if (tags.year?.length > 0)
    {
        const year = parseInt(tags.year);

        if (!isNaN(year))
        {
            tempMetadata.year = year;
            song.tag.year = year;
        }
    }

    if (tags.picture?.length > 0)
    {
        const split = tags.picture.match(/^data:(.+?)(;base64)?,(.*)$/);

        if (split !== null)
        {
            const buf = Buffer.from(split[3], 'base64');

            sharp(buf).webp({quality: 70}).toFile(path.join(__dirname, `./appdata/webp/${tempMetadata.albumID}.webp`));
            
            song.tag.pictures[0].mimeType = split[1];
            song.tag.pictures[0].data = new Uint8Array(buf);
        }        
    }

    songMetadata.set(file, tempMetadata);
    song.save();
    song.dispose();

    if (audioPlayer.queue[audioPlayer.currentQueueItem] === file) audioPlayer.setNowPlaying(file, false);

    WINDOW.webContents.send(toastEvent, {type: 'success', text: `Metatags for were changed successfully`});
});

ipcMain.on('ipc-minimize', () => WINDOW.minimize());

ipcMain.on('ipc-maximize', () => WINDOW.maximize());

ipcMain.on('ipc-close', (E, data) =>
{
    if (!config.get('systemTray')) return exitApp(data);

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
    ipcMain.emit('APPDATA', {albums, config, eqs, queues, songList, songMetadata});

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