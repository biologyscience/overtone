function removeFolder(obj)
{
    const foldersToRemove = obj.detail === undefined ? obj : obj.detail;

    const
        config = new util.json('app/json/config.json'),
        songList = new util.json('app/json/songList.json'),
        metadata = new util.json('app/json/metadata.json'),
        albums = new util.json('app/json/albums.json'),
        albumsData = albums.read(),
        metadataData = metadata.read(),
        songListData = songList.read(),
        configData = config.read(),
        newFolders = configData.checkMusicIn.filter(x => !foldersToRemove.includes(x));
        
    configData.checkMusicIn = newFolders;
    foldersToRemove.forEach(x => delete songListData[x]);

    for (const x in metadataData)
    {
        foldersToRemove.forEach((y) =>
        {
            if (x.startsWith(y))
            {
                delete metadataData[x];
            }
        });
    }

    for (const x in albumsData)
    {
        const newSongList = albumsData[x].songs.filter((y) =>
        {
            let check = true;

            foldersToRemove.forEach(z => y.startsWith(z) ? check = false : null);

            return check;
        });

        if (newSongList.length === 0) delete albumsData[x];

        else albumsData[x].songs = newSongList;
    }
    
    config.save();
    songList.save();
    metadata.save();
    albums.save();
};

function clickInFolder(E)
{
    if (E.target.tagName !== 'IMG') return;

    const folderPath = E.target.parentElement.dataset.path;

    const removeFolderButton = document.getElementById('removeFolder');

    const foldersToRemove = JSON.parse(removeFolderButton.dataset.paths);

    if (foldersToRemove.includes(folderPath)) return;

    foldersToRemove.push(folderPath);    

    removeFolderButton.dataset.paths = JSON.stringify(foldersToRemove);
};

function shiftFocus()
{
    const
        removeFolderButton = document.getElementById('removeFolder'),
        span = removeFolderButton.querySelector('span'),
        deleteFolder = document.querySelectorAll('.deleteFolder');
    
    if (span.innerHTML === 'Done')
    {
        const foldersToRemove = JSON.parse(removeFolderButton.dataset.paths);

        if (foldersToRemove.length > 0)
        {
            Array.from(document.getElementById('folders').children).filter(x => foldersToRemove.includes(x.dataset.path)).forEach(x => x.remove());

            removeFolder(foldersToRemove);
        }

        span.innerHTML = 'Remove a folder';
        removeFolderButton.style.borderColor = '';

        deleteFolder.forEach((x) =>
        {
            x.animate([
                {
                    opacity: 1,
                    transform: 'rotate(360deg)'
                },

                {
                    opacity: 1,
                    offset: 0.6
                },
                
                {
                    opacity: 0,
                    transform: 'rotate(0deg)'
                }
            ], {duration: 1000, easing: 'ease', fill: 'forwards'});
        });

        deleteFolder.forEach(x => x.classList.add('pointerEventsNone'));
    }

    else
    {
        deleteFolder.forEach(x => x.classList.remove('pointerEventsNone'));
        
        span.innerHTML = 'Done';
        removeFolderButton.style.borderColor = 'var(--accent)';

        deleteFolder.forEach((x) =>
        {
            x.animate([
                {
                    opacity: 0,
                    transform: 'rotate(0deg)'
                },

                {
                    opacity: 1,
                    offset: 0.4
                },
                
                {
                    opacity: 1,
                    transform: 'rotate(360deg)'
                }
            ], {duration: 1000, easing: 'ease', fill: 'forwards'});
        });
    }
};

document.getElementById('removeFolder').addEventListener('click', shiftFocus);
document.getElementById('folders').addEventListener('click', clickInFolder);
document.addEventListener('-removeFolder', removeFolder);