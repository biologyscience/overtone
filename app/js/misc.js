document.getElementById('misc').onclick = () =>
{
    return;

    const fs = require('fs');

    const { read, formatter, buffer2DataURL } = require('./js/util');

    fs.readdirSync('app/album arts/webp').forEach((x) =>
    {
        const fl = 'app/album arts/webp/' + x;

        const dataURL = buffer2DataURL('image/webp', fs.readFileSync(fl));

        ee[x.split('.')[0]] = dataURL;
    });

    fs.writeFileSync('app/json/new.json', JSON.stringify(ee, null, 4));

    console.log('')

    // document.dispatchEvent(new Event('-makeAlbumList'));



    return;

    const sharp = require('sharp');


    const albums = read.albums();
    const metadata = read.metadata();

    console.time();

    for (const x in albums)
    {
        const meta = metadata[albums[x].songs[0]];

        const name = formatter(meta.album, meta.albumArtist);

        if (fs.existsSync(`app/album arts/${name}.jpeg`))
        {
            sharp(`app/album arts/${name}.jpeg`)
            .toFormat('webp')
            .resize(500, 500)
            .toFile(`app/album arts/webp/${name}.webp`);
        }
    }

    console.timeEnd();

    return;


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
                    year: tags[i].year,
                    songs: [`E:\\Music\\${p[i]}`],
                    rawDuration: tags[i].rawDuration
                };
            }

            else
            {
                lol[tags[i].album].songs.push(`E:\\Music\\${p[i]}`);

                lol[tags[i].album].rawDuration = lol[tags[i].album].rawDuration + tags[i].rawDuration;
            }
        }

        albums.save();

        console.log('dont');
    });
}