function makeAlbumList()
{
    const { read, getAlbumArt } = require('./js/util');

    const albums = read.albums();

    const
        albumMap = new Map(Object.entries(albums)),
        // albumArts = [...albumMap.values()].map(x => getAlbumArt(x.ref)),
        albumNames = [...albumMap.keys()];

    const appendIn = document.querySelector('section.album .body');

    albumNames.forEach((x) =>
    {
        const albumItem = document.createElement('div');

        albumItem.innerHTML =
        `
        <img src="">
        <span class="albumName block overflowPrevent">${x}</span>
        `;

        albumItem.classList.add('albumItem');
        albumItem.dataset.albumName = x;

        appendIn.append(albumItem);
    });

    return;

    Promise.all(albumArts).then((pictures) =>
    {
        const appendIn = document.querySelector('section.album .body');

        for (let i = 0; i < pictures.length; i++)
        {
            const picture = pictures[i];

            if (picture.buffer !== undefined)
            {
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
        }

        document.dispatchEvent(new Event('-albumReady'));
    });

};

document.addEventListener('-makeAlbumList', makeAlbumList);