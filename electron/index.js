const { app, BrowserWindow, ipcMain } = require('electron');

function ready()
{
    const WINDOW = new BrowserWindow
    ({
        width: 1920 / 1.5,
        height: 1200 / 1.5,
        // frame: false,
        title: 'OverTone'
    });
    
    if (process.argv.includes('--file')) WINDOW.loadFile('../react/dist/index.html');
    else WINDOW.loadURL('http://localhost:8520');

    ipcMain.on('ipc-minimize', () => WINDOW.minimize());
    ipcMain.on('ipc-maximize', () => WINDOW.maximize());
    ipcMain.on('ipc-close', () => WINDOW.close());
};

app.on('ready', ready);