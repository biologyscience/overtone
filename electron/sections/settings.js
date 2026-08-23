const { app, ipcMain, dialog } = require('electron');
const { readFileSync, readdirSync, createWriteStream, rmSync, cpSync } = require('fs');
const path = require('path');
const archiver = require('archiver');
const extractor = require('extract-zip');

const audioPlayer = require('../player');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

let config, appdataLocation;
ipcMain.on('APPDATA', obj => { config = obj.config; appdataLocation = obj.location; });

ipcMain.on('ipc-updateConfig', (E, {value, keys}) =>
{
    if (value === undefined || value === null || (typeof(value) === 'number' && isNaN(value))) return;

    const configData = JSON.parse(readFileSync(config.path));

    let ref = configData;

    while (keys.length > 1) ref = ref[keys.shift()];

    ref[keys.shift()] = value;

    app.setLoginItemSettings({openAtLogin: configData.launchOnStartup});

    config.store = configData;
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
    zip.directory(appdataLocation, false);

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
        const restoredPath = path.join(appdataLocation, '../restored/');

        await extractor(location[0], {dir: restoredPath});

        const files = readdirSync(restoredPath);

        const partial = ['albums.json', 'config.json', 'queues.json', 'songList.json', 'songMetadata.json'].map(x => files.includes(x)).includes(false);

        return { partial };
    }

    catch (E) { return false; }
});

ipcMain.on('ipc-restoreNow', () =>
{
    rmSync(appdataLocation, {recursive: true});
    cpSync(path.join(appdataLocation, '../restored/'), appdataLocation, {recursive: true});
    rmSync(path.join(appdataLocation, '../restored/'), {recursive: true});

    const files = readdirSync(appdataLocation);

    files.forEach((file) =>
    {
        if (['albums.json', 'config.json', 'queues.json', 'songList.json', 'songMetadata.json', 'webp'].includes(file)) return;

        rmSync(path.join(appdataLocation, file), {recursive: true});
    });

    audioPlayer.reset();

    app.relaunch();
    app.exit();
});

ipcMain.on('ipc-resetApp', () =>
{
    rmSync(appdataLocation, {recursive: true});

    audioPlayer.reset();

    app.relaunch();
    app.exit();
});