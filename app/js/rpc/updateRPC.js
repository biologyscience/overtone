let client;

function updateRPC({detail})
{
    const fileLocation = detail;

    if (client === undefined) return;

    const { formatter, getMetaData } = require('./js/util');

    getMetaData(fileLocation).then((tags) =>
    {    
        const pressence = 
        {
            details: tags.title,
            state: tags.albumArtist,
            largeImageKey: formatter(tags.album, tags.albumArtist),
            largeImageText: tags.album
        };
    
        client.setActivity(pressence);
    });
};

document.addEventListener('-RPC', ({detail}) => client = detail);
document.addEventListener('-updateRPC', updateRPC);