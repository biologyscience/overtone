const metadata = require('music-metadata');

function updateMediaSessionMetaData(navigator, filePath)
{
    metadata.parseFile(filePath).then((tags) =>
    {
        const mediaMetaData = 
        {
            title: tags.common?.title,
            artist: tags.common?.albumartist,
            album: tags.common?.album,
            artwork:
            [
                {
                    src: 'data:' + tags.common.picture[0].format + ';base64,' + tags.common.picture[0].data.toString('base64'),
                    type: tags.common.picture[0].format
                }
            ]
        };

        navigator.mediaSession.metadata = new MediaMetadata(mediaMetaData);
    });
};

module.exports = updateMediaSessionMetaData;