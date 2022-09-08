const
    remote = require('@electron/remote/main'),
    { app, BrowserWindow, ipcMain } = require('electron'),
    { existsSync, writeFileSync } = require('fs');

remote.initialize();

function ready()
{
    const WINDOW = new BrowserWindow
    ({
        width: 1280,
        height: 720,
        frame: false,
        // icon: '',
        webPreferences:
        {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    remote.enable(WINDOW.webContents);

    WINDOW.loadFile('index.html').then(() => WINDOW.maximize());

    ipcMain.on('ipc-minimize', () => WINDOW.minimize());
    ipcMain.on('ipc-maximize', () => WINDOW.maximize());
    ipcMain.on('ipc-close', () => WINDOW.close());
};

['albums', 'config', 'metadata', 'queues', 'songList'].forEach((x) =>
{
    const path = `app/json/${x}.json`;

    let data = {};

    if (existsSync(path) === false)
    {
        x === 'config' ? data = { "allowedMusicFileFormats": [ "mp3", "flac", "ogg" ] } : null;

        writeFileSync(path, JSON.stringify(data, null, 4));
    }
});

app.on('ready', ready);