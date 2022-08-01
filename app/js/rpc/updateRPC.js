const metadata = require('music-metadata');
const formatter = require('../formatter');

let firstAlertOver = false;

function updateRPC(filePath)
{
    const client = require('./rpc');

    if (client.clientId === undefined)
    {
        if (!firstAlertOver)
        {
            firstAlertOver = true;
            alert('ALERT: RPC is not connected');
        }

        return;
    }

    metadata.parseFile(filePath).then((tags) =>
    {
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
    });
};

module.exports = updateRPC;