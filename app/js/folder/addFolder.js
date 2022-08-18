let
    allFolders = [],
    filtered = [];

const
    { readdirSync, statSync } = require('fs'),
    { join } = require('path'),
    { json, readConfig } = require('./js/util');

function getAllFolders(path)
{
    readdirSync(path).filter(x => statSync(join(path, x)).isDirectory()).forEach((y) =>
    {
        const fullPath = join(path, y);

        allFolders.push(fullPath);

        getAllFolders(fullPath);
    });
};

function filterFolders()
{
    const formats = readConfig().allowedMusicFileFormats;

    allFolders.forEach((x) =>
    {
        const files = readdirSync(x).filter(y => statSync(join(x, y)).isDirectory() === false);

        for (const file of files)
        {
            const
                part = file.split('.'),
                format = part[part.length - 1];

            if (formats.includes(format))
            {
                filtered.push(x);
                break;
            }
        }
    });
};

function addFolder()
{
    const { dialog, BrowserWindow } = require('@electron/remote');

    dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {properties: ['openDirectory', 'multiSelections']})
    .then((selected) =>
    {
        if (selected.canceled) return;

        const
            config = new json('app/config.json'),
            data = config.read();

        selected.filePaths.forEach((x) =>
        {
            allFolders.push(x);
            getAllFolders(x);
        });

        filterFolders();

        if (filtered.length === 0) return;

        if (data['checkMusicIn'] === undefined)
        { data['checkMusicIn'] = filtered; }

        else
        {
            filtered.forEach((x) =>
            {
                if (data['checkMusicIn'].includes(x) === false)
                { data['checkMusicIn'].push(x); }
            });
        }

        config.save();

        document.dispatchEvent(new Event('-updateFolders'));

        allFolders = null;
        filtered = null;
    });
};

document.getElementById('addFolder').addEventListener('click', addFolder);