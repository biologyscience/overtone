const { ipcMain } = require('electron');

const { appdata } = require('../util');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

ipcMain.on('ipc-wantEQs', () =>
{
    WINDOW.webContents.send('ipc-takeEQs', appdata.get('eqs'));
});

ipcMain.on('ipc-savePreset', (E, {name, gains}) =>
{
    const eqs = appdata.get('eqs');

    eqs[name] = gains;

    appdata.set('eqs', eqs);

    WINDOW.webContents.send('ipc-takeEQs', eqs);
});