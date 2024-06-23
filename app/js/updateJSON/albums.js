function updateAlbums({detail: {tags, songList}})
{
    const
        albums = new util.json('app/json/albums.json'),
        data = albums.read();

    for (let i = 0; i < songList.length; i++)
    {
        let formattedName = 'unknown';

        const { album, albumArtist, year, rawDuration } = tags[i];
        
        if (album !== undefined && albumArtist !== undefined) { formattedName = util.formatter(album, albumArtist); }

        const albumInJSON = data[formattedName];

        if (albumInJSON === undefined)
        {
            data[formattedName] =
            {
                album: album,
                artist: albumArtist,
                rawDuration: rawDuration,
                songs: [songList[i]],
                year
            };

            document.dispatchEvent(new CustomEvent('-createWEBPalbumArt', {detail: {filePath: songList[i], picName: formattedName}}));
        }

        else
        {
            albumInJSON.songs.push(songList[i]);
            albumInJSON.rawDuration = albumInJSON.rawDuration + rawDuration;
        }
    }

    albums.save();
};

document.addEventListener('-updateJSON/albums', updateAlbums);