let
    allFolders = [],
    filtered = [];

const
    { readdirSync, statSync } = require('fs'),
    { join } = require('path'),
    { json, validateMusicFileFormat } = require('./js/util');

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
    allFolders.forEach((x) =>
    {
        const files = readdirSync(x).filter(y => !statSync(join(x, y)).isDirectory());

        for (const file of files)
        {
            if (validateMusicFileFormat(file))
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
            config = new json('app/json/config.json'),
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
                <img src="svg/close.svg" class="deleteFolder pointerEventsNone">
                `;

                folders.append(li);
            }
        });

        const songList = [];

        filtered.forEach((dir) =>
        {
            readdirSync(dir)
            .filter(a => !statSync(join(dir, a)).isDirectory())
            .filter(b => validateMusicFileFormat(b))
            .map(c => join(dir, c))
            .forEach(x => songList.push(x));
        });

        document.dispatchEvent(new CustomEvent('-updateJSON/albums', {detail: songList}));
        document.dispatchEvent(new CustomEvent('-updateJSON/metadata', {detail: songList}));
        document.dispatchEvent(new CustomEvent('-updateJSON/songList', {detail: filtered}));

        allFolders = [];
        filtered = [];
    });
};

document.getElementById('addFolder').addEventListener('click', addFolder);