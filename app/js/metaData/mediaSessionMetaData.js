function updateMediaSessionMetaData({detail})
{
    const tags = detail;

    const mediaMetaData = 
    {
        title: tags.title,
        artist: tags.albumArtist,
        album: tags.album,
        artwork:
        [
            {
                src: tags.picture.URL,
                format: tags.picture.format
            }
        ]
    };

    navigator.mediaSession.metadata = new MediaMetadata(mediaMetaData);
};

document.addEventListener('-updateMetaData', updateMediaSessionMetaData);