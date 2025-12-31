const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron');
const metadata = require('music-metadata');
const { mkdirSync, existsSync, writeFileSync, readdirSync, statSync } = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto')

const { appdata, parseTime } = require('./util');

let WINDOW = null;

if (!existsSync(path.join(__dirname, './appdata/'))) mkdirSync(path.join(__dirname, './appdata/'));
if (!existsSync(path.join(__dirname, './appdata/webp'))) mkdirSync(path.join(__dirname, './appdata/webp'));

['albums', 'artists', 'config', 'metadata', 'queues', 'songList', 'itunesCache'].forEach((x) =>
{
    const filepath = path.join(__dirname, `./appdata/${x}.json`);

    let data = {};

    if (existsSync(filepath)) return;

    if (x === 'config')
    {
        data =
        {
            allowedMusicFileFormats: ['mp3', 'flac', 'ogg'],
            font: 'Fira',
            volume: 1,
            discordAppID: '1312407617540456458',
            discordRPCconnect: false,
            checkMusicIn: [],
            lastQueueState: {}
        };
    }

    writeFileSync(filepath, JSON.stringify(data, null, 4));
});

ipcMain.handle('ipc-wantFolders', () => 
{
    const { checkMusicIn } = appdata.get('config');

    return [...checkMusicIn];
});

ipcMain.handle('ipc-deleteFolders', (E, toDelete) => 
{   
    const config = appdata.get('config');

    toDelete.forEach((x) =>
    {
        const index = config.checkMusicIn.indexOf(x);

        if (index !== -1) config.checkMusicIn.splice(index, 1);
        
        else
        {
            // send error
        }
    });

    appdata.set('config', config);

    return [...config.checkMusicIn];
});

ipcMain.handle('ipc-addFolders', () =>
{
    const dirs = dialog.showOpenDialogSync(WINDOW, { properties: ['openDirectory', 'multiSelections'] });

    if (dirs === undefined) return [];

    const filtered = [];

    while (dirs.length > 0)
    {
        const folder = dirs.shift();

        const files = readdirSync(folder).filter(x => !statSync(path.join(folder, x)).isDirectory());

        for (const file of files)
        {
            if (/\.(mp3|flac|ogg)$/i.test(file))
            {
                filtered.push(folder);
                break;
            }
        }

        readdirSync(folder).filter(x => statSync(path.join(folder, x)).isDirectory()).forEach(y => dirs.push(path.join(folder, y)));
    }

    function alphabeticalOrder(a, b) { return a.split('/').pop().split('\\').pop().localeCompare(b.split('/').pop().split('\\').pop()) }

    const config = appdata.get('config');
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');

    const newFolders = filtered.filter(x => !config.checkMusicIn.includes(x));
    let newSongs = [];
    
    newFolders.forEach((dir) =>
    {
        const songListInFolder = readdirSync(dir)
        .filter(a => !statSync(path.join(dir, a)).isDirectory())
        .filter(x => /\.(mp3|flac|ogg)$/i.test(x))
        .map(b => path.join(dir, b));

        newSongs = newSongs.concat(songListInFolder).sort(alphabeticalOrder);

        songList[dir] = [...songListInFolder];
    });

    appdata.set('songList', songList);
    
    Promise.all(newSongs.map(x => metadata.parseFile(x, {skipPostHeaders: true}))).then(async (results) =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const { album, albumartist, artists, bpm, disk, genre, title, track, year, picture } = results[i].common;

            const
                time = parseTime(results[i].format.duration),
                hours = time.hours,
                minutes = time.minutes,
                seconds = time.seconds.toString().length > 1 ? time.seconds : `0${time.seconds}`;
            
            let duration;

            time.hours > 0 ? duration = `${hours}:${minutes}:${seconds}` : duration = `${minutes}:${seconds}`;

            const data = { album, albumartist, artists, bpm, disk, genre, title, track, year, duration, rawDuration: results[i].format.duration };
            
            const albumartID = crypto.createHash('md5').update(`${album}_${albumartist}`).digest('hex');

            if (existsSync(path.join(__dirname, `./appdata/webp/${albumartID}.webp`))) data.albumartID = albumartID;

            if (!existsSync(path.join(__dirname, `./appdata/webp/${albumartID}.webp`)) && (picture[0] !== undefined))
            {
                data.albumartID = albumartID;

                await sharp(picture[0].data).resize({height: 1000}).webp({quality: 70}).toFile(path.join(__dirname, `./appdata/webp/${albumartID}.webp`));                
            }

            songMetadata[newSongs[i]] = data;
        }

        appdata.set('songMetadata', songMetadata);
    });

    const newList = config.checkMusicIn.concat(newFolders).sort(alphabeticalOrder);

    config.checkMusicIn = newList;

    appdata.set('config', config);

    return [...config.checkMusicIn];
});

ipcMain.handle('ipc-wantFolder', (E, folder) =>
{
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');
    
    return songList[folder].map((file) =>
    {
        const { title, artists, album, rawDuration } = songMetadata[file];

        return { artist: artists.join(', '), location: file, duration: rawDuration, title, album };
    });
});

ipcMain.handle('ipc-wantAlbums', () =>
{
    const dummy = [
        {
            album: 'lessgoo',
            artist: 'damn bro',
        },
        {
            album: 'song name one',
            artist: 'lessgoo',
        },
        {
            artist: 'song name one',
            album: 'damn bro',
        },
        {
            album: 'song name one',
            artist: 'lessgoo',
        },
        {
            artist: 'song name one',
            album: 'damn bro',
        },
        {
            album: 'song name one',
            artist: 'lessgoo',
        },
        {
            album: 'song name one',
            artist: 'lessgoo',
        },
        {
            artist: 'song name one',
            album: 'damn bro',
        },
        {
            album: 'song name one',
            artist: 'lessgoo',
        },
        {
            artist: 'song name one',
            album: 'damn bro',
        },
        {
            album: 'song name one',
            artist: 'lessgoo',
        }
    ]
    
    return [...dummy, ...dummy];
});

ipcMain.handle('ipc-wantAlbum', (E, {album, artist}) =>
{
    const dummy =
    {
        album,
        artist,
        year: 2020,
        songs: 
        [
            {
                title: 'song name one',
                duration: 289,
                location: 'C:/lol/one/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist, 'abc'],
                plays: Math.floor(Math.random() * 10)
            },
            {
                title: 'damn bro',
                duration: 510,
                location: 'C:/lol/two/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist],
                plays: Math.floor(Math.random() * 10)
            },
            {
                title: 'lessgoo',
                duration: 100,
                location: 'C:/oof/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist],
                plays: Math.floor(Math.random() * 10)
            },
            {
                title: 'damn bro',
                duration: 510,
                location: 'C:/lol/two/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist],
                plays: Math.floor(Math.random() * 10)
            },
            {
                title: 'lessgoo',
                duration: 100,
                location: 'C:/oof/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist],
                plays: Math.floor(Math.random() * 10)
            },
            {
                title: 'damn bro',
                duration: 510,
                location: 'C:/lol/two/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist],
                plays: Math.floor(Math.random() * 10)
            },
            {
                title: 'lessgoo',
                duration: 100,
                location: 'C:/oof/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist],
                plays: Math.floor(Math.random() * 10)
            },
            {
                title: 'damn bro',
                duration: 510,
                location: 'C:/lol/two/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist],
                plays: Math.floor(Math.random() * 10)
            },
            {
                title: 'lessgoo',
                duration: 100,
                location: 'C:/oof/song.mp3',
                track: Math.floor(Math.random() * 10),
                artists: [artist],
                plays: Math.floor(Math.random() * 10)
            }
        ]
    };

    return dummy;
});

ipcMain.handle('ipc-wantArtists', () =>
{
    const dummy = [ 'lessgoo', 'song name one', 'yoyoyo', 'song name one', 'yoyoyo', 'yoyoyo', 'yoyoyo', 'yoyoyo', 'lessgoo', 'song name one', 'yoyoyo', 'song name one' ];

    return [...dummy, ...dummy];
});

ipcMain.handle('ipc-wantArtist', (E, {artist}) =>
{
    const dummy = [
        {
            album: 'lessgoo',
            year: 1900 + Math.floor(Math.random() * 100)
        },
        {
            album: 'song name one',
            year: 1900 + Math.floor(Math.random() * 100)
        },
        {
            album: 'yoyoyo',
            year: 1900 + Math.floor(Math.random() * 100)
        },
        {
            album: 'song name one',
            year: 1900 + Math.floor(Math.random() * 100)
        },
        {
            album: 'yoyoyo',
            year: 1900 + Math.floor(Math.random() * 100)
        },
        {
            album: 'lessgoo',
            year: 1900 + Math.floor(Math.random() * 100)
        }
    ]

    return dummy;
});

ipcMain.handle('ipc-nowPlaying', async () =>
{
    const file = 'C:/Files/Music/All Me.flac';

    const { format, common } = await metadata.parseFile(file);

    const image = `data:${common.picture[0].format};base64,${common.picture[0].data.toString('base64')}`;

    const dummy =
    {
        title: common.title,
        artist: common.artists.join('; '),
        album: common.album,
        duration: format.duration,
        image,
        file
    }

    return dummy;
});

app.on('ready', () =>
{
    WINDOW = new BrowserWindow
    ({
        width: 1920 / 1.5,
        height: 1200 / 1.5,
        frame: false,
        title: 'OverTone',
        icon: `${__dirname}/logo.png`,
        webPreferences:
        {
            webSecurity: false,
            nodeIntegration: false,
            contextIsolation: true,
            preload: `${__dirname}/preload.js`,
        }
    });

    if (process.argv.includes('--file')) WINDOW.loadFile('../react/dist/index.html');
    else WINDOW.loadURL('http://localhost:8520');

    ipcMain.on('ipc-minimize', () => WINDOW.minimize());
    ipcMain.on('ipc-maximize', () => WINDOW.maximize());
    ipcMain.on('ipc-close', () => WINDOW.close());

    protocol.handle('music', (request) =>
    {
        const { pathname } = new URL(request.url);

        return net.fetch(pathname.slice(1));
    });
});