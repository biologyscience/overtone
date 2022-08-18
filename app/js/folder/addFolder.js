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

        if (data.checkMusicIn === undefined)
        { data.checkMusicIn = filtered; }

        else
        {
            filtered.forEach((x) =>
            {
                if (data.checkMusicIn.includes(x) === false)
                { data.checkMusicIn.push(x); }
            });
        }

        config.save();

        allFolders = [];
        filtered = [];

        const
            folders = document.getElementById('folders'),
            paths = Array.from(folders.children).map(x => x.dataset.path);

        data.checkMusicIn.forEach((x) =>
        {
            if (paths.includes(x) === false)
            {
                const li = document.createElement('li');

                const name = x.split('\\');

                li.classList.add('folderItem', 'grid');

                li.dataset.path = x;

                li.innerHTML =
                `
                <img class="folder" src="svg/folder.svg">
                <div class="flexCol">
                    <span class="name">${name[name.length - 1]}</span>
                    <span class="path">${name.join('/')}</span>
                </div>
                <img src="svg/close.svg" class="deleteFolder hide">
                `;

                folders.append(li);
            }
        });
    });
};

document.getElementById('addFolder').addEventListener('click', addFolder);