function updateArtists({detail})
{
    const
        tags = detail,
        artists = new util.json('app/json/artists.json'),
        data = artists.read();

    tags.forEach((tag) =>
    {
        const { albumArtist, album, year } = tag;

        if (data[albumArtist] === undefined) data[albumArtist] = [];

        if (data[albumArtist].filter(x => x.album === album).length === 0) data[albumArtist].push({album, year});
    });

    artists.save();
};

document.addEventListener('-updateJSON/artists', updateArtists);