const
    outArtist = { wait: false, lastInput: undefined },
    inArtist = { wait: false, lastInput: undefined };

function displayNone(x) { x.style.display = 'none'; };
function displayRevert(x) { x.style.display = ''; };

function searchOutArtist(E)
{
    const input = E.target;

    if (outArtist.wait) return;

    outArtist.wait = true;

    if (outArtist.lastInput === input.value.toLowerCase()) return outArtist.wait = false;

    outArtist.lastInput = input.value.toLowerCase();

    const artistItems = Array.from(document.querySelector('section.artist .out .body').children);

    artistItems.forEach(x => x.classList.remove('displayNone'));

    const filtered = artistItems.filter(x => !x.dataset.artist.toLowerCase().includes(outArtist.lastInput));

    filtered.length === artistItems.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
    
    filtered.forEach(x => x.classList.add('displayNone'));

    setTimeout(() =>
    {
        outArtist.wait = false;

        if (outArtist.lastInput === input.value.toLowerCase()) return;

        searchOutArtist(E);
    }, 500);
};
        
function searchInArtist(E)
{
    const input = E.target;
    
    if (inArtist.wait) return;
    
    inArtist.wait = true;

    if (inArtist.lastInput === input.value.toLowerCase()) return inArtist.wait = false;

    inArtist.lastInput = input.value.toLowerCase();

    const albumList = Array.from(document.getElementById('albumListInArtist').children);

    albumList.forEach(displayRevert);

    const filtered = albumList.filter(x => !x.dataset.albumName.toLowerCase().includes(inArtist.lastInput));

    filtered.length === albumList.length ? input.classList.add('noMatch') : input.classList.remove('noMatch');
    
    filtered.forEach(displayNone);

    setTimeout(() =>
    {
        inArtist.wait = false;

        if (inArtist.lastInput === input.value.toLowerCase()) return;

        searchInArtist(E);
    }, 500);
};

document.getElementById('outArtistInput').addEventListener('input', searchOutArtist);
document.getElementById('inArtistInput').addEventListener('input', searchInArtist);