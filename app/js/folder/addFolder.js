let
    allFolders = [],
    filtered = [];

function getAllFolders(folderPath)
{
    fs.readdirSync(folderPath).filter(x => fs.statSync(path.join(folderPath, x)).isDirectory()).forEach((y) =>
    {
        const fullPath = path.join(folderPath, y);

        allFolders.push(fullPath);

        getAllFolders(fullPath);
    });
};

function filterFolders()
{
    allFolders.forEach((x) =>
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

        selected.filePaths.forEach((x) =>
        {
            allFolders.push(x);
            getAllFolders(x);
        });

        filterFolders();

        if (filtered.length === 0) return;

        data.checkMusicIn = data.checkMusicIn === undefined ? filtered : [...new Set([...data.checkMusicIn, ...filtered])];

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
            fs.readdirSync(dir)
            .filter(a => !fs.statSync(path.join(dir, a)).isDirectory())
            .filter(b => util.validateMusicFileFormat(b))
            .map(c => path.join(dir, c))
            .forEach(x => songList.push(x));
        });

        document.dispatchEvent(new CustomEvent('-updateJSON/songList', {detail: filtered}));

        Promise.all(songList.map(util.getMetaData)).then((tags) =>
        {
            document.dispatchEvent(new CustomEvent('-updateJSON/albums', {detail: {tags, songList}}));
            document.dispatchEvent(new CustomEvent('-updateJSON/artists', {detail: tags}));
            document.dispatchEvent(new CustomEvent('-updateJSON/metadata', {detail: {tags, songList}}));
        });

        allFolders = [];
        filtered = [];
    });
};

document.getElementById('addFolder').addEventListener('click', addFolder);