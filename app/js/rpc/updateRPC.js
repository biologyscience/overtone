let client;

function updateRPC({detail})
{
    const tags = detail;

    if (client === undefined) return;

    const pressence = 
    {
        details: tags.title,
        state: tags.albumArtist,
        largeImageKey: util.formatter(tags.album, tags.albumArtist),
        largeImageText: tags.album
    };

    client.setActivity(pressence);
};

// document.addEventListener('-RPC', ({detail}) => client = detail);
// document.addEventListener('-updateMetaData', updateRPC);