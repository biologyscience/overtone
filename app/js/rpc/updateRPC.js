let client;

function updateRPC({detail})
{
    const tags = detail;

    if (client === undefined) return;

    const { formatter } = require('./js/util');

    const pressence = 
    {
        details: tags.title,
        state: tags.albumArtist,
        largeImageKey: formatter(tags.album, tags.albumArtist),
        largeImageText: tags.album
    };

    client.setActivity(pressence);
};

document.addEventListener('-RPC', ({detail}) => client = detail);
document.addEventListener('-updateRPC', updateRPC);