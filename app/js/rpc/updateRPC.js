let client;

function updateRPC({detail})
{
    const tags = detail;

    const { formatter } = require('./js/util');

    if (client === undefined) return;

    const
        songName = tags.common?.title,
        albumArtist = tags.common?.albumartist,
        albumName = tags.common?.album;

    const pressence = 
    {
        details: songName,
        state: albumArtist,
        largeImageKey: formatter(albumName, albumArtist),
        largeImageText: albumName
    };

    client.setActivity(pressence);
};

document.addEventListener('-RPC', ({detail}) => client = detail);
document.addEventListener('-updateMetaData', updateRPC);