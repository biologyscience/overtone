const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron');
const metadata = require('music-metadata');
const { readdirSync, statSync } = require('fs');
const path = require('path');

let WINDOW = null;

ipcMain.handle('ipc-wantFolders', () => 
{
    const folderData = 
    [
        'C:\\Files\\Music',
        'C:\\Files\\Music\\Mashups',
        'C:\\Files\\Music\\MegaMix',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 1',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 2',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 3'
    ];

    return folderData;
});

ipcMain.handle('ipc-deleteFolders', (E, toDelete) => 
{
    const folderData = 
    [
        'C:\\Files\\Music',
        'C:\\Files\\Music\\Mashups',
        'C:\\Files\\Music\\MegaMix',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 1',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 2',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 3'
    ];

    toDelete.forEach((x) =>
    {
        const index = folderData.indexOf(x);

        if (index !== -1)
        {
            folderData.splice(index, 1);

            // update db
        }
        
        else
        {
            // send error
        }
    });

    return folderData;
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

    return filtered;
});

ipcMain.handle('ipc-wantFolder', (E, folder) =>
{
    const dummy = [
        {
            title: 'song name one',
            album: 'lessgoo',
            artist: 'damn bro',
            duration: 289,
            location: 'C:/lol/one/song.mp3'
        },
        {
            album: 'song name one',
            artist: 'lessgoo',
            title: 'damn bro',
            duration: 510,
            location: 'C:/lol/two/song.mp3'
        },
        {
            artist: 'song name one',
            title: 'lessgoo',
            album: 'damn bro',
            duration: 100,
            location: 'C:/oof/song.mp3'
        }
    ]
    
    return dummy;
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
    const file = 'C:/Files/Music/gigolo.mp3';

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