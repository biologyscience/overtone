function updateAlbums({detail})
{
    const pathToSongs = detail;

    const { getMetaData, json, formatter } = require('./js/util');
    
    const
        albums = new json('app/json/albums.json'),
        data = albums.read();

    Promise.all(pathToSongs.map(getMetaData)).then((tags) =>
    {
        for (let i = 0; i < pathToSongs.length; i++)
        {
            let formattedName = 'unknown';

            const { album, albumArtist, year, rawDuration } = tags[i];
            
            if (album !== undefined && albumArtist !== undefined) { formattedName = formatter(album, albumArtist); }

            const albumInJSON = data[formattedName];

            if (albumInJSON === undefined)
            {
                data[formattedName] =
                {
                    album: album,
                    artist: albumArtist,
                    rawDuration: rawDuration,
                    songs: [pathToSongs[i]],
                    year
                };

                document.dispatchEvent(new CustomEvent('-createWEBPalbumArt', {detail: {filePath: pathToSongs[i], picName: formattedName}}));
            }

            else
            {
                albumInJSON.songs.push(pathToSongs[i]);
                albumInJSON.rawDuration = albumInJSON.rawDuration + rawDuration;
            }
        }

        albums.save();
    });
};

document.addEventListener('-updateJSON/albums', updateAlbums);