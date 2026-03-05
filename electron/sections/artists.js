const { ipcMain } = require('electron');
const { existsSync } = require('fs');
const path = require('path');
const crypto = require('crypto');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

let songMetadata;
ipcMain.on('APPDATA', obj => songMetadata = obj.songMetadata);

ipcMain.handle('ipc-wantArtists', () =>
{
    const artists = [];

    for (const filepath in songMetadata.store) artists.push(songMetadata.store[filepath].artists[0]);

    const unique = [...new Set(artists)].map((artist) =>
    {
        const picturePath = path.join(__dirname, `../appdata/webp/${crypto.createHash('md5').update(artist).digest('hex')}.webp`)

        const picture = existsSync(picturePath) ? picturePath : 'https://brucecoughlin.com/data/default_artwork/music_ph.png';

        return { artist, picture };
    });

    return unique;
});

ipcMain.handle('ipc-wantArtist', (E, {artist}) =>
{
    const albums = {};

    for (const filepath in songMetadata.store)
    {
        if (!songMetadata.store[filepath].artists.includes(artist)) continue;

        const { album, year, albumID } = songMetadata.store[filepath];

        if (albums?.[album]?.year === undefined && year !== undefined) albums[album] === undefined ? albums[album] = { year } : albums[album].year = year;
        if (albums?.[album]?.albumart === undefined && albumID !== undefined) albums[album] === undefined ? albums[album] = { albumart: path.join(__dirname, `../appdata/webp/${albumID}.webp`) } : albums[album].albumart = path.join(__dirname, `../appdata/webp/${albumID}.webp`);
    }

    const toSend = [];

    for (const album in albums)
    {
        toSend.push({
            album,
            year: albums[album].year,
            albumart: albums[album].albumart || 'https://brucecoughlin.com/data/default_artwork/music_ph.png'
        });
    }

    const picturePath = path.join(__dirname, `../appdata/webp/${crypto.createHash('md5').update(artist).digest('hex')}.webp`)

    const picture = existsSync(picturePath) ? picturePath : 'https://brucecoughlin.com/data/default_artwork/music_ph.png';

    return { picture, albums: toSend };
});