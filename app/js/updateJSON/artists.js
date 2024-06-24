function updateArtists({detail})
{
    const
        tags = detail,
        temp = [];

    const
        artists = new util.json('app/json/artists.json'),
        data = artists.read();

    tags.forEach((tag) =>
    {
        const { albumArtist, album, year } = tag;

        if (!temp.includes(albumArtist))
        {
            temp.push(albumArtist);

            data[albumArtist] = [];
        }

        let albumExists = false;

        data[albumArtist].forEach((x) => x.album === album ? albumExists = true : null);

        if (!albumExists) data[albumArtist].push({ album, year });
    });

    artists.save();
};

document.addEventListener('-updateJSON/artists', updateArtists);