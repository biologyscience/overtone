/*
code not to be used later (ln 15 17 34) 
reason: code should not be used in later stages (ref js/album/observer.js)
instead use ln 37
*/

function makeAlbumList()
{
    const
        albums = util.read.albums(),
        albumNames = [...new Map(Object.entries(albums)).keys()];

    const appendIn = document.querySelector('section.album .out .body');

    const albumObservers = require('./js/album/observer');

    albumObservers.MO.observe(appendIn, {childList: true});

    albumNames.forEach((x) =>
    {
        const albumItem = document.createElement('div');

        albumItem.innerHTML =
        `
        <img src="webp/${x}.webp">
        <span class="albumName block overflowPrevent">${albums[x].album}</span>
        `;

        albumItem.classList.add('albumItem');
        albumItem.dataset.id = x;

        appendIn.append(albumItem);

        albumObservers.IO.observe(albumItem);
    });

    // document.dispatchEvent(new Event('-AlbumSectionReady'));

    document.getElementById('albumCount').innerHTML = `${albumNames.length} Album${albumNames.length > 1 ? 's' : ''}`;
};

makeAlbumList();