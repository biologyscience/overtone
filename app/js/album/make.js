function makeAlbumList()
{
    const { read } = require('./js/util');

    const
        albums = read.albums(),
        albumNames = [...new Map(Object.entries(albums)).keys()];

    const appendIn = document.querySelector('section.album .body');

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
    });
};

// document.addEventListener('-makeAlbumList', makeAlbumList);
makeAlbumList();