function updateAlbums({detail: {tags, songsToAdd, songsToRemove}})
{
    const
        albums = new util.json('app/json/albums.json'),
        data = albums.read(),
        deletedAlbums = [];

    for (let i = 0; i < songsToAdd.length; i++)
    {
        const { album, albumArtist, year, rawDuration } = tags[i];   

        const formattedName = util.formatter(album, albumArtist);

        const albumInJSON = data[formattedName];

        if (albumInJSON === undefined)
        {
            data[formattedName] =
            {
                album: album,
                artist: albumArtist,
                rawDuration: rawDuration,
                songs: [songsToAdd[i]],
                year
            };

            document.dispatchEvent(new CustomEvent('-createWEBPalbumArt', {detail: {filePath: songsToAdd[i], picName: formattedName}}));
        }

        else
        {
            albumInJSON.songs.push(songsToAdd[i]);
            albumInJSON.rawDuration = albumInJSON.rawDuration + rawDuration;
        }
    }

    const metadata = util.read.metadata();

    songsToRemove.forEach((x) =>
    {
        const { album, albumArtist } = metadata[x];

        const formattedName = util.formatter(album, albumArtist);

        if (data[formattedName].songs.length === 1)
        {
            delete data[formattedName];

            deletedAlbums.push({album, albumArtist});

            fs.unlinkSync(path.join(__dirname, `webp/${formattedName}.webp`));
        }

        else data[formattedName].songs.splice(data[formattedName].songs.indexOf(songsToRemove[i], 1));
    });

    albums.save();

    setTimeout(() => document.dispatchEvent(new CustomEvent('-updateJSON/removeArtists', {detail: deletedAlbums})));
};

document.addEventListener('-updateJSON/albums', updateAlbums);