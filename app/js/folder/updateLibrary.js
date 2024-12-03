function updateLibraryButton()
{
    const updateSongList = document.getElementById('updateSongList');

    updateSongList.classList.toggle('current');
    updateSongList.querySelector('img').classList.toggle('animate');

    setTimeout(() =>
    {
        if (!updateSongList.classList.contains('current')) return;
        
        document.dispatchEvent(new CustomEvent('-updateJSON/songList', {detail: util.read.config().checkMusicIn}));

        updateLibraryButton();
    }, 500);
};

function updateLibraryUI()
{
// to do
};

document.getElementById('updateSongList').addEventListener('click', updateLibraryButton);