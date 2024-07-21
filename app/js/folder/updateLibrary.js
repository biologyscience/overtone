function updateLibraryButton()
{
    const updateSongList = document.getElementById('updateSongList');

    updateSongList.classList.toggle('current');
    updateSongList.querySelector('img').classList.toggle('animate');

    setTimeout(() => { if (updateSongList.classList.contains('current')) updateLibrary(); }, 500);
};

function updateLibraryUI()
{
// to do
};

function updateLibrary()
{
    document.dispatchEvent(new CustomEvent('-updateJSON/songList', {detail: util.read.config().checkMusicIn}));

    setTimeout(() =>
    {
        const
            songList = util.read.songList(),
            updatedList = [],
            addSongList = [],
            removeSongList = [],
            metadata = util.read.metadata();
    
        for (const x in songList) { songList[x].forEach(y => updatedList.push(y)); }
        
        for (const file in metadata) { if (!updatedList.includes(file)) removeSongList.push(file); }
    
        updatedList.forEach(file => metadata[file] === undefined ? addSongList.push(file) : null);
        
        Promise.all(addSongList.map(util.getMetaData)).then((tags) =>
        {
            // also update other json
            document.dispatchEvent(new CustomEvent('-updateJSON/metadata', {detail: {tags, addSongList, removeSongList}}));
         
            updateLibraryUI();
            updateLibraryButton();
        });            
    });
};

document.getElementById('updateSongList').addEventListener('click', updateLibraryButton);