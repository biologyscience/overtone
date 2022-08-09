const electron = require('electron');
const remote = require('@electron/remote/main');

remote.initialize();

const app = electron.app;
const ipcMain = electron.ipcMain;
const ipcRenderer = electron.ipcRenderer;

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
});

ipcMain.on('queueList', () =>
{
    const window = new electron.BrowserWindow
    ({
        width: 0.6 * 0.5 * 1920,
        height: 0.6 * 1080,
        minimizable: false,
        maximizable: false,
        resizable: false,
        frame: false,

        webPreferences:
        {
            nodeIntegration: true,
            contextIsolation: false
        }

    });

    window.loadFile('html/temp.html');
});