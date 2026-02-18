const { ipcMain } = require('electron');
const path = require('path');

const { appdata } = require('../util');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

ipcMain.handle('ipc-wantAlbums', () =>
{
    const albums = appdata.get('albums');

    const albumData = [];

    for (const ID in albums)
    {
        let albumart = 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

        if (albums[ID].hasArt) albumart = path.join(__dirname, `../appdata/webp/${ID}.webp`);

        albumData.push({album: albums[ID].album, artist: albums[ID].artists[0], albumart, accent: albums[ID].colors.Vibrant});
    }

    return albumData;
});

ipcMain.handle('ipc-wantAlbum', (E, {album, artist}) =>
{
    const songMetadata = appdata.get('songMetadata');

    const albumData = { album, songs: [] };

    const albums = appdata.get('albums');

    for (const ID in albums)
    {
        if (albums[ID].album === album && albums[ID].artists.includes(artist))
        {
            albumData.colors = albums[ID].colors;
            albumData.artist = albums[ID].artists[0];
            albumData.year = albums[ID].year;
            albumData.albumart = albums[ID].hasArt ? path.join(__dirname, `../appdata/webp/${ID}.webp`) : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

            albumData.songs = albums[ID].songs.map((filepath) =>
            {
                const { title, rawDuration, track, artists, playCount } = songMetadata[filepath];

                const data =
                {
                    title,
                    artists,
                    duration: rawDuration,
                    location: filepath,
                    track: track?.no || 0,
                    plays: playCount || 0
                }
                
                return data;
            });

            albumData.songs.sort((x, y) => x.track - y.track);

            break;
        }
    }

    return albumData;
});