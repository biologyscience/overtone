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

existsSync('app/config.json') ? null : writeFileSync('app/config.json', JSON.stringify({}));
existsSync('app/queues.json') ? null : writeFileSync('app/queues.json', JSON.stringify({}));