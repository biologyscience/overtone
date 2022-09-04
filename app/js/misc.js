document.getElementById('misc').onclick = () =>
{
    document.dispatchEvent(new Event('-makeAlbumList'));

    return;

    const fs = require('fs');

    const { validateMusicFileFormat, getMetaData, json } = require('./js/util');

    const p = fs.readdirSync('E:/Music')
    .filter(x => !fs.statSync(`E:/Music/${x}`).isDirectory())
    .filter(validateMusicFileFormat);

    Promise.all(p.map(x => getMetaData(`E:/Music/${x}`))).then((tags) =>
    {
        const albums = new json('app/json/albums.json');

        const lol = albums.read();

        for (let i = 0; i < tags.length; i++)
        {
            if (lol[tags[i].album] === undefined)
            {
                lol[tags[i].album] =
                {
                    artist: tags[i].albumArtist,
                    ref: `E:/Music/${p[i]}`
                };
            }
        }

        albums.save();

        console.log('dont');
    });
}