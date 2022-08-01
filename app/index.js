const electron = require('electron');
const remote = require('@electron/remote/main');

remote.initialize();

const app = electron.app;

app.on('ready', () =>
{
    const window = new electron.BrowserWindow
    ({
        width: 1920,
        height: 1080,
        minimizable: true,
        maximizable: true,
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
});