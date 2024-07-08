function updateMetaData({detail})
{
    const { title, album, albumArtist, picture } = detail;

    const div =
    {
        songName: document.getElementById('songName'),
        artistName: document.getElementById('artistName'),
        albumName: document.getElementById('albumName')
    };

    const img = { albumArt: document.getElementById('albumArt') };

    picture.buffer === undefined ? img.albumArt.setAttribute('src', 'svg/empty.svg') : img.albumArt.setAttribute('src', picture.URL);

    div.songName.innerHTML = title;
    div.albumName.innerHTML = album;
    div.artistName.innerHTML = albumArtist;
};

document.addEventListener('-updateMetaData', updateMetaData);