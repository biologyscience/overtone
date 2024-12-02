function displayNone(x) { x.style.display = 'none'; };
function displayRevert(x) { x.style.display = ''; };

function search(E)
{
    const input = E.target;

    if (input.classList.contains('IgnoreForSearch')) return;

    const
        id = input.id,
        inputValue = input.value.toLowerCase();

    const selector =
    {
        folderInput: '#songListInFolder',
        outAlbumInput: 'section.album .out .body',
        inAlbumInput: '#songListInAlbum',
        outArtistInput: 'section.artist .out .body',
        inArtistInput: '#albumListInArtist'
    };

    const filterFunction =
    {
        folderInput: (x) => { return !x.dataset.title.includes(inputValue); },
        outAlbumInput: (x) => { return !util.read.albums()[x.dataset.id].album.toLowerCase().includes(inputValue); },
        inAlbumInput: (x) => { return !x.dataset.songName.toLowerCase().includes(inputValue); },
        outArtistInput: (x) => { return !x.dataset.artist.toLowerCase().includes(inputValue); },
        inArtistInput: (x) => { return !x.dataset.albumName.toLowerCase().includes(inputValue); }
    };
    
    const list = Array.from(document.querySelector(selector[id]).children);

    list.forEach(displayRevert);

    const filtered = list.filter(filterFunction[id]);

    filtered.length === list.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
    
    filtered.forEach(displayNone);
};

document.querySelectorAll('input:not([type="checkbox"])').forEach(x => x.addEventListener('input', search));