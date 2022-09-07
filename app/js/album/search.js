const
    outAlbum = { wait: false, lastInput: undefined },
    inAlbum = { wait: false, lastInput: undefined };

function displayNone(x) { x.style.display = 'none'; };
function displayRevert(x) { x.style.display = ''; };

function searchOutAlbum(E)
{
    const input = E.target;

    if (outAlbum.wait) return;

    outAlbum.wait = true;

    if (outAlbum.lastInput === input.value.toLowerCase()) return outAlbum.wait = false;

    outAlbum.lastInput = input.value.toLowerCase();

    const albumItems = Array.from(document.querySelector('section.album .out .body').children);

    albumItems.forEach(x => x.classList.remove('displayNone'));

    albumItems
    .filter(x => !x.dataset.albumName.toLowerCase().includes(outAlbum.lastInput))
    .forEach(x => x.classList.add('displayNone'));

    setTimeout(() =>
    {
        outAlbum.wait = false;

        if (outAlbum.lastInput === input.value.toLowerCase()) return;

        searchOutAlbum(E);
    }, 500);
};
        
function searchInAlbum(E)
{
    const input = E.target;
    
    if (inAlbum.wait) return;
    
    inAlbum.wait = true;

    if (inAlbum.lastInput === input.value.toLowerCase()) return inAlbum.wait = false;

    inAlbum.lastInput = input.value.toLowerCase();

    const songList = Array.from(document.getElementById('songListInAlbum').children);

    songList.forEach(displayRevert);

    songList
    .filter(x => !x.dataset.songName.includes(inAlbum.lastInput))
    .forEach(displayNone);

    setTimeout(() =>
    {
        inAlbum.wait = false;

        if (inAlbum.lastInput === input.value.toLowerCase()) return;

        searchInAlbum(E);
    }, 500);
};

document.getElementById('outAlbumInput').addEventListener('input', searchOutAlbum);
document.getElementById('inAlbumInput').addEventListener('input', searchInAlbum);