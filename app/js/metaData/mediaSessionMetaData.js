function updateMediaSessionMetaData({detail})
{
    const tags = detail;

    const { buffer2DataURL } = require('./js/util');

    const mediaMetaData = 
    {
        title: tags.common?.title,
        artist: tags.common?.albumartist,
        album: tags.common?.album,
        artwork:
        [
            {
                src: buffer2DataURL(tags.common?.picture?.[0]?.format, tags.common.picture?.[0]?.data),
                format: tags.common?.picture?.[0]?.format
            }
        ]
    };

    navigator.mediaSession.metadata = new MediaMetadata(mediaMetaData);
};

document.addEventListener('-updateMetaData', updateMediaSessionMetaData);