function displayNone(x) { x.style.display = 'none'; };
function displayRevert(x) { x.style.display = ''; };

function searchInFolder(E)
{
    const input = E.target;
    
    const songListInFolder = document.getElementById('songListInFolder');

    const children = Array.from(songListInFolder.children);

    children.forEach(x => x.classList.remove('displayNone'));

    const filtered = children.filter(x => !x.dataset.title.includes(input.value.toLowerCase()));

    filtered.length === children.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
    
    filtered.forEach(x => x.classList.add('displayNone'));
};

function searchOutAlbum(E)
{
    const input = E.target;

    const albumItems = Array.from(document.querySelector('section.album .out .body').children);

    albumItems.forEach(x => x.classList.remove('displayNone'));

    const filtered = albumItems.filter(x => !util.read.albums()[x.dataset.id].album.toLowerCase().includes(input.value.toLowerCase()));

    filtered.length === albumItems.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
    
    filtered.forEach(x => x.classList.add('displayNone'));
};
        
function searchInAlbum(E)
{
    const input = E.target;

    const songList = Array.from(document.getElementById('songListInAlbum').children);

    songList.forEach(displayRevert);

    console.log(songList);

    const filtered = songList.filter(x => !x.dataset.songName.toLowerCase().includes(input.value.toLowerCase()));

    filtered.length === songList.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
    
    filtered.forEach(displayNone);
};

function searchOutArtist(E)
{
    const input = E.target;

    const artistItems = Array.from(document.querySelector('section.artist .out .body').children);

    artistItems.forEach(x => x.classList.remove('displayNone'));

    const filtered = artistItems.filter(x => !x.dataset.artist.toLowerCase().includes(input.value.toLowerCase()));

    filtered.length === artistItems.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
    
    filtered.forEach(x => x.classList.add('displayNone'));
};
        
function searchInArtist(E)
{
    const input = E.target;

    const albumList = Array.from(document.getElementById('albumListInArtist').children);

    albumList.forEach(displayRevert);

    const filtered = albumList.filter(x => !x.dataset.albumName.toLowerCase().includes(input.value.toLowerCase()));

    filtered.length === albumList.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
    
    filtered.forEach(displayNone);
};

document.getElementById('folderInput').addEventListener('input', searchInFolder);
document.getElementById('outAlbumInput').addEventListener('input', searchOutAlbum);
document.getElementById('inAlbumInput').addEventListener('input', searchInAlbum);
document.getElementById('outArtistInput').addEventListener('input', searchOutArtist);
document.getElementById('inArtistInput').addEventListener('input', searchInArtist);