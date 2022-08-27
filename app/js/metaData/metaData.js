function updateMetaData({detail})
{
    const tags = detail;

    const div =
    {
        songName: document.getElementById('songName'),
        artistName: document.getElementById('artistName'),
        albumName: document.getElementById('albumName')
    };

    const img = { albumArt: document.getElementById('albumArt') };

    tags.picture.buffer === undefined ? img.albumArt.setAttribute('src', 'svg/empty.svg') : img.albumArt.setAttribute('src', tags.picture.URL);

    div.songName.innerHTML = tags.title;
    div.artistName.innerHTML = tags.albumArtist;
    div.albumName.innerHTML = tags.album;
};

document.addEventListener('-updateMetaData', updateMetaData);