function updateMetaData({detail})
{
    const tags = detail;

    const { buffer2DataURL } = require('./js/util');

    const div =
    {
        songName: document.getElementById('songName'),
        artistName: document.getElementById('artistName'),
        albumName: document.getElementById('albumName')
    };

    const img = { albumArt: document.getElementById('albumArt') };

    img.albumArt.setAttribute('src', './svg/empty.svg');

    if (tags.common?.picture)
    {
        const albumArt = buffer2DataURL(tags.common.picture[0].format, tags.common.picture[0].data);

        img.albumArt.setAttribute('src', albumArt);
    }

    div.songName.innerHTML = tags.common?.title;
    div.artistName.innerHTML = tags.common?.albumartist;
    div.albumName.innerHTML = tags.common?.album;
};

document.addEventListener('-updateMetaData', updateMetaData)