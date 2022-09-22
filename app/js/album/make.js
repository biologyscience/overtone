function makeAlbumList()
{
    const { read } = require('./js/util');

    const
        albums = read.albums(),
        albumNames = [...new Map(Object.entries(albums)).keys()];

    const appendIn = document.querySelector('section.album .out .body');

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

        /* below code should not be used in later stages (ref js/album/observer.js) */
        const albumObservers = require('./js/album/observer');
        albumObservers.IO.observe(albumItem);
    });

    // document.dispatchEvent(new Event('-AlbumSectionReady'));

    document.getElementById('albumCount').innerHTML = `${albumNames.length} Album${albumNames.length > 1 ? 's' : ''}`;
};

makeAlbumList();