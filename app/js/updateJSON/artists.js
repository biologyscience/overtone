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
        const { albumArtist, album } = tag;

        if (!temp.includes(albumArtist))
        {
            temp.push(albumArtist);

            data[albumArtist] = [];
        }

        if (!data[albumArtist].includes(album)) data[albumArtist].push(album);
    });

    artists.save();
};

document.addEventListener('-updateJSON/artists', updateArtists);