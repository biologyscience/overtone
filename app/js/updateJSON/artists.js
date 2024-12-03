function addArtists({detail})
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

function removeArtists({detail})
{
    const
        deletedAlbums = detail,
        artists = new util.json('app/json/artists.json'),
        data = artists.read();

    deletedAlbums.forEach(({album, albumArtist}) =>
    {
        console.log(album, albumArtist);

        if (data[albumArtist].length === 1) delete data[albumArtist];

        else data[albumArtist].splice(data[albumArtist].indexOf(data[albumArtist].filter(x => x.album === album)), 1);
    });

    artists.save();
};

document.addEventListener('-updateJSON/addArtists', addArtists);
document.addEventListener('-updateJSON/removeArtists', removeArtists);