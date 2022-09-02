const
    remote = require('@electron/remote/main'),
    { app, BrowserWindow } = require('electron'),
    { watch } = require('chokidar'), 
    { existsSync, writeFileSync } = require('fs');

remote.initialize();

app.on('ready', () =>
{
    const window = new BrowserWindow
    ({
        width: 1280,
        height: 720,
        autoHideMenuBar: true,
        // icon: '',

        webPreferences:
        {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    remote.enable(window.webContents);

    window.loadFile('index.html');

    const watcher = watch(['app/css', 'app/js', 'app/index.html']);

    watcher.on('ready', () =>
    {
        watcher.on('all', () => window.reload());
    });
});

['config', 'metadata', 'queues', 'songList'].forEach((x) =>
{
    const path = `app/json/${x}.json`;

    let data = {};

    if (existsSync(path) === false)
    {
        x === 'config' ? data = { "allowedMusicFileFormats": [ "mp3", "flac", "ogg" ] } : null;

        writeFileSync(path, JSON.stringify(data, null, 4));
    }
});