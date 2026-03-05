const { app, ipcMain, dialog } = require('electron');
const { readdirSync, createWriteStream, rmSync, cpSync } = require('fs');
const path = require('path');
const archiver = require('archiver');
const extractor = require('extract-zip');

const { appdata } = require('../util');
const audioPlayer = require('../player');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

let config;
ipcMain.on('APPDATA', obj => config = obj.config);

ipcMain.on('ipc-updateConfig', (E, {value, keys}) =>
{
    if (value === undefined || value === null || (typeof(value) ==='number' && isNaN(value))) return;

    const config = appdata.get('config');

    let ref = config;

    while (keys.length > 1) ref = ref[keys.shift()];

    ref[keys.shift()] = value;

    app.setLoginItemSettings({openAtLogin: config.launchOnStartup});

    appdata.set('config', config);
});

ipcMain.on('ipc-saveColorTheme', (E, {name, colors}) =>
{
    config.set(`colors.themes.${name}`, colors);
});

ipcMain.handle('ipc-wantThemeColors', (E, theme) =>
{
    return config.get(`colors.themes.${theme}`);
});

ipcMain.handle('ipc-backupAppdata', async () =>
{
    const pathSafeTime = new Date(Date.now()).toLocaleString().replaceAll('/', '-').replaceAll(':', '-').replaceAll(',', '').replaceAll(' ', '_');

    const location = dialog.showSaveDialogSync(WINDOW, {title: 'Export app data as .zip', defaultPath: `OverTone_Backup_${pathSafeTime}`, filters: [{extensions: ['zip'], name: 'ZIP File'}]});

    if (location === undefined) return;

    const writeStream = createWriteStream(location);
    const zip = archiver('zip');

    zip.pipe(writeStream);
    zip.directory(path.join(__dirname, './appdata/'), false);

    try
    {
        await zip.finalize();

        return location;
    }

    catch (E) { return false; }
});

ipcMain.handle('ipc-restoreAppdata', async () =>
{
    const location = dialog.showOpenDialogSync(WINDOW, {title: 'Choose a OverTone backup (.zip)', filters: [{extensions: ['zip'], name: 'ZIP File'}]});

    if (location === undefined) return;

    try
    {
        const restoredPath = path.join(__dirname, './restored/');

        await extractor(location[0], {dir: restoredPath});

        const files = readdirSync(restoredPath);

        const partial = ['albums.json', 'config.json', 'queues.json', 'songList.json', 'songMetadata.json'].map(x => files.includes(x)).includes(false);

        return { partial };
    }

    catch (E) { return false; }
});

ipcMain.on('ipc-restoreNow', () =>
{
    rmSync(path.join(__dirname, './appdata/'), {recursive: true});
    cpSync(path.join(__dirname, './restored/'), path.join(__dirname, './appdata/'), {recursive: true});
    rmSync(path.join(__dirname, './restored/'), {recursive: true});

    const files = readdirSync(path.join(__dirname, './appdata/'));

    files.forEach((file) =>
    {
        if (['albums.json', 'config.json', 'queues.json', 'songList.json', 'songMetadata.json', 'webp'].includes(file)) return;

        rmSync(path.join(__dirname, './appdata/', file), {recursive: true});
    });

    audioPlayer.reset();

    app.relaunch();
    app.exit();
});

ipcMain.on('ipc-resetApp', () =>
{
    rmSync(path.join(__dirname, './appdata/'), {recursive: true});

    audioPlayer.reset();

    app.relaunch();
    app.exit();
});