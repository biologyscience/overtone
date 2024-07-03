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
        width: 1280,
        height: 720,
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

    WINDOW.loadFile('index.html').then(() => WINDOW.maximize());

    ipcMain.on('ipc-minimize', () => WINDOW.minimize());
    ipcMain.on('ipc-maximize', () => WINDOW.maximize());
    ipcMain.on('ipc-close', () => WINDOW.close());
};

['albums', 'artists', 'config', 'metadata', 'queues', 'songList'].forEach((x) =>
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
                volume: 1
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