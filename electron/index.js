const { app, BrowserWindow, ipcMain, dialog} = require('electron');

const { readdirSync, statSync } = require('fs');
const path = require('path');

let WINDOW = null;

ipcMain.handle('ipc-wantFolders', () => 
{
    const folderData = 
    [
        'C:\\Files\\Music',
        'C:\\Files\\Music\\Mashups',
        'C:\\Files\\Music\\MegaMix',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 1',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 2',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 3'
    ];

    return folderData;
});

ipcMain.handle('ipc-deleteFolders', (E, toDelete) => 
{
    const folderData = 
    [
        'C:\\Files\\Music',
        'C:\\Files\\Music\\Mashups',
        'C:\\Files\\Music\\MegaMix',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 1',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 2',
        'C:\\Files\\Music\\DEATH NOTE Original Soundtrack\\Part 3'
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

ipcMain.handle('ipc-addFolders', () =>
{
    const dirs = dialog.showOpenDialogSync(WINDOW, { properties: ['openDirectory', 'multiSelections'] });

    if (dirs === undefined) return [];

    const filtered = [];

    while (dirs.length > 0)
    {
        const folder = dirs.shift();

        const files = readdirSync(folder).filter(x => !statSync(path.join(folder, x)).isDirectory());

        for (const file of files)
        {
            if (/\.(mp3|flac|ogg)$/i.test(file))
            {
                filtered.push(folder);
                break;
            }
        }

        readdirSync(folder).filter(x => statSync(path.join(folder, x)).isDirectory()).forEach(y => dirs.push(path.join(folder, y)));
    }

    return filtered;
});

ipcMain.handle('ipc-wantFolder', (E, folder) =>
{
    const dummy = [
        {
            title: 'song name one',
            album: 'lessgoo',
            artist: 'damn bro',
            duration: 289
        },
        {
            album: 'song name one',
            artist: 'lessgoo',
            title: 'damn bro',
            duration: 510
        },
        {
            artist: 'song name one',
            title: 'lessgoo',
            album: 'damn bro',
            duration: 100
        }
    ]
    
    return dummy;
});

app.on('ready', () =>
{
    WINDOW = new BrowserWindow
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
});