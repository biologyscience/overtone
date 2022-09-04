function makeAlbumList()
{
    const { read, getAlbumArt } = require('./js/util');

    const albums = read.albums();

    const
        albumMap = new Map(Object.entries(albums)),
        albumArts = [...albumMap.values()].map(x => getAlbumArt(x.ref)),
        albumNames = [...albumMap.keys()];

    Promise.all(albumArts).then((pictures) =>
    {
        const appendIn = document.querySelector('section.album .body');

        for (let i = 0; i < pictures.length; i++)
        {
            const picture = pictures[i];

            const albumItem = document.createElement('div');

            albumItem.innerHTML =
            `
            <img src="${picture.URL}">
            <span class="albumName block overflowPrevent">${albumNames[i]}</span>
            `;

            albumItem.classList.add('albumItem');
            albumItem.dataset.albumName = albumNames[i];

            appendIn.append(albumItem);
        }
    });

};

document.addEventListener('-makeAlbumList', makeAlbumList);