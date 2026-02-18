const { ipcMain } = require('electron');
const { existsSync } = require('fs');
const path = require('path');
const crypto = require('crypto');

const { appdata } = require('../util');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

ipcMain.handle('ipc-wantArtists', () =>
{
    const songMetadata = appdata.get('songMetadata');

    const artists = [];

    for (const filepath in songMetadata) artists.push(songMetadata[filepath].artists[0]);

    const unique = [...new Set(artists)].map((artist) =>
    {
        const picturePath = path.join(__dirname, `../appdata/webp/${crypto.createHash('md5').update(artist).digest('hex')}.webp`)

        const picture = existsSync(picturePath) ? picturePath : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

        return { artist, picture };
    });

    return unique;
});

ipcMain.handle('ipc-wantArtist', (E, {artist}) =>
{
    const songMetadata = appdata.get('songMetadata');

    const albums = {};

    for (const filepath in songMetadata)
    {
        if (!songMetadata[filepath].artists.includes(artist)) continue;

        const { album, year, albumID } = songMetadata[filepath];

        if (albums?.[album]?.year === undefined && year !== undefined) albums[album] === undefined ? albums[album] = { year } : albums[album].year = year;
        if (albums?.[album]?.albumart === undefined && albumID !== undefined) albums[album] === undefined ? albums[album] = { albumart: path.join(__dirname, `../appdata/webp/${albumID}.webp`) } : albums[album].albumart = path.join(__dirname, `../appdata/webp/${albumID}.webp`);
    }

    const toSend = [];

    for (const album in albums)
    {
        toSend.push({
            album,
            year: albums[album].year,
            albumart: albums[album].albumart || 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png'
        });
    }

    const picturePath = path.join(__dirname, `../appdata/webp/${crypto.createHash('md5').update(artist).digest('hex')}.webp`)

    const picture = existsSync(picturePath) ? picturePath : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

    return { picture, albums: toSend };
});