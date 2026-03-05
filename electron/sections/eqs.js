const { ipcMain } = require('electron');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

let eqs;
ipcMain.on('APPDATA', obj => eqs = obj.eqs);

ipcMain.on('ipc-wantEQs', () =>
{
    WINDOW.webContents.send('ipc-takeEQs', eqs.store);
});

ipcMain.on('ipc-savePreset', (E, {name, gains}) =>
{
    eqs.set(name, gains);

    WINDOW.webContents.send('ipc-takeEQs', eqs.store);
});