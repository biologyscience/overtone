const { app, BrowserWindow, ipcMain } = require('electron');

function ready()
{
    const WINDOW = new BrowserWindow
    ({
        width: 1920 / 1.5,
        height: 1200 / 1.5,
        frame: false,
        title: 'OverTone',
        icon: `${__dirname}/logo.png`,
        webPreferences:
        {
            nodeIntegration: false,
            contextIsolation: true,
            preload: `${__dirname}/preload.js`
        }
    });
    
    if (process.argv.includes('--file')) WINDOW.loadFile('../react/dist/index.html');
    else WINDOW.loadURL('http://localhost:8520');

    ipcMain.on('ipc-minimize', () => WINDOW.minimize());
    ipcMain.on('ipc-maximize', () => WINDOW.maximize());
    ipcMain.on('ipc-close', () => WINDOW.close());
};

ipcMain.handle('ipc-wantFolders', () => 
{
    const folderData = 
    [
        'C:/one2/waohj/folderPath1',
        'C:/one2/waohj/folderPath2',
        'C:/one2/waohj\\folderPath3',
        'C:/one2/waohj\\yyoyo',
        'C:/one2/waohj\\rPath3',
    ];

    return folderData;
});

ipcMain.handle('ipc-deleteFolders', (E, toDelete) => 
{
    const folderData = 
    [
        'C:/one2/waohj/folderPath1',
        'C:/one2/waohj/folderPath2',
        'C:/one2/waohj\\folderPath3',
        'C:/one2/waohj\\yyoyo',
        'C:/one2/waohj\\rPath3',
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

app.on('ready', ready);