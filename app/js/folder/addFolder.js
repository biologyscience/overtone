function getAllFolders(folderPath)
{
    const folders = [];

    const temp = [];

    folderPath.forEach(x => temp.push(x));

    while (temp.length > 0)
    {
        const folder = temp.shift();

        folders.push(folder);

        fs.readdirSync(folder).filter(x => fs.statSync(path.join(folder, x)).isDirectory()).forEach(y => temp.push(path.join(folder, y)));
    }

    return folders;
};

function filterFolders(folders)
{
    const filtered = [];

    folders.forEach((x) =>
    {
        const files = fs.readdirSync(x).filter(y => !fs.statSync(path.join(x, y)).isDirectory());

        for (const file of files)
        {
            if (util.validateMusicFileFormat(file))
            {
                filtered.push(x);
                break;
            }
        }
    });

    return filtered;
};

function addFolder()
{
    remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), {properties: ['openDirectory', 'multiSelections']})
    .then((selected) =>
    {
        if (selected.canceled) return;

        const
            config = new util.json('app/json/config.json'),
            data = config.read();

        const allFolders = getAllFolders(selected.filePaths);

        const filtered = filterFolders(allFolders);

        if (filtered.length === 0) return;

        data.checkMusicIn = data.checkMusicIn === undefined ? filtered : Array.from(new Set([...data.checkMusicIn, ...filtered]));

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

        document.dispatchEvent(new CustomEvent('-updateJSON/songList', {detail: filtered}));
    });
};

document.getElementById('addFolder').addEventListener('click', addFolder);