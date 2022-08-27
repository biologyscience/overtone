const
    electron = require('electron'),
    remote = require('@electron/remote/main'),
    { existsSync, writeFileSync } = require('fs');

remote.initialize();

const app = electron.app;

app.on('ready', () =>
{
    const window = new electron.BrowserWindow
    ({
        width: 1920,
        height: 1080,
        autoHideMenuBar: true,
        // icon: '',

        webPreferences:
        {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    remote.enable(window.webContents);

    window.loadFile('index.html').then(() => window.maximize());
    // window.loadFile('temp/file.html').then(() => window.maximize());
});

['config', 'metadata', 'queues', 'songList'].forEach((x) =>
{
    const path = `app/json/${x}.json`;

    let data = JSON.stringify({}, null, 4);

    if (existsSync(path) === false)
    {
        if (x === 'config')
        {
            data = JSON.stringify({
                "regexp": "\\.(mp3|flac|ogg)$",
                "allowedMusicFileFormats": [ "mp3", "flac", "ogg" ]
            }, null, 4);
        }

        writeFileSync(path, data);
    }
});