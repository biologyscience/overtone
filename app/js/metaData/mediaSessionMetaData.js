function updateMediaSessionMetaData({detail})
{
    const { title, albumArtist, album, picture } = detail;

    const mediaMetaData = 
    {
        title,
        artist: albumArtist,
        album,
        artwork:
        [
            {
                src: picture.URL,
                format: picture.format
            }
        ]
    };

    navigator.mediaSession.metadata = new MediaMetadata(mediaMetaData);
};

document.addEventListener('-updateMetaData', updateMediaSessionMetaData);