let
    allFolders = [],
    filtered = [];

const
    { readdirSync, statSync } = require('fs'),
    { join } = require('path'),
    { json, getMetaData, validateMusicFileFormat } = require('./js/util');

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
        const files = readdirSync(x).filter(y => statSync(join(x, y)).isDirectory() === false);

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

function updateMetaData(data)
{
    const
        tags = [],
        paths = [];

    const
        metadata = new json('app/json/metadata.json'),
        content = metadata.read();

    for (const x in data)
    {
        data[x].forEach((a) =>
        {
            tags.push(getMetaData(a));
            paths.push(a);
        });
    }

    Promise.all(tags).then((x) =>
    {
        for (let i = 0; i < x.length; i++) { content[paths[i]] = x[i]; }

        metadata.save();
    });
};

function saveSongList()
{
    const
        songList = new json('app/json/songList.json'),
        data = songList.read();

    filtered.forEach((x) =>
    {
        const songListInFolder = readdirSync(x)
        .filter(a => !statSync(join(x, a)).isDirectory())
        .filter(b => validateMusicFileFormat(b))
        .map(c => join(x, c));

        data[x] = songListInFolder;
    });

    songList.save();

    updateMetaData(data);
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

        saveSongList();

        allFolders = [];
        filtered = [];
    });
};

document.getElementById('addFolder').addEventListener('click', addFolder);