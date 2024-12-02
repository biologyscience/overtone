const
    remote = require('@electron/remote/main'),
    { app, BrowserWindow, ipcMain } = require('electron'),
    { existsSync, writeFileSync } = require('fs'),
    { join } = require('path');

remote.initialize();

function ready()
{
    const WINDOW = new BrowserWindow
    ({
        width: 540,
        height: 540,
        frame: false,
        title: 'OverTone',
        // icon: '',
        webPreferences:
        {
            contextIsolation: false,
            nodeIntegration: true,
            // preload: join(__dirname, 'preload.js')
        }
    });

    remote.enable(WINDOW.webContents);

    WINDOW.loadFile('index.html');

    ipcMain.on('ipc-minimize', () => WINDOW.minimize());
    ipcMain.on('ipc-maximize', () => WINDOW.maximize());
    ipcMain.on('ipc-close', () => WINDOW.close());
};

['albums', 'artists', 'config', 'metadata', 'queues', 'songList', 'itunesCache'].forEach((x) =>
{
    const path = `app/json/${x}.json`;

    let data = {};

    if (existsSync(path) === false)
    {
        if (x === 'config')
        {
            data =
            {
                allowedMusicFileFormats: ['mp3', 'flac', 'ogg'],
                font: 'Fira',
                volume: 1,
                discordAppID: '1312407617540456458',
                discordRPCconnect: true
            };
        }
        
        if (x === 'queues')
        {
            data =
            {
                queueOrder: []
            };
        }

        writeFileSync(path, JSON.stringify(data, null, 4));
    }
});

app.on('ready', ready);