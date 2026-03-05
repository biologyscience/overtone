const { ipcMain } = require('electron');
const path = require('path');

let albums, songMetadata;
ipcMain.on('APPDATA', (obj) =>
{
    albums = obj.albums;
    songMetadata = obj.songMetadata;
});

ipcMain.handle('ipc-wantAlbums', () =>
{
    const albumData = [];

    const data = { ...albums.store };

    for (const ID in data)
    {
        let albumart = 'https://brucecoughlin.com/data/default_artwork/music_ph.png';

        const album = data[ID];

        if (album.hasArt) albumart = path.join(__dirname, `../appdata/webp/${ID}.webp`);

        albumData.push({album: album.album, artist: album.artists[0], albumart, accent: album.colors.Vibrant});
    }

    return albumData;
});

ipcMain.handle('ipc-wantAlbum', (E, {album, artist}) =>
{
    const albumData = { album, songs: [] };

    const data = { ...albums.store };

    for (const ID in data)
    {
        const albumItem = data[ID];

        if (albumItem.album === album && albumItem.artists.includes(artist))
        {
            albumData.colors = albumItem.colors;
            albumData.artist = albumItem.artists[0];
            albumData.year = albumItem.year;
            albumData.albumart = albumItem.hasArt ? path.join(__dirname, `../appdata/webp/${ID}.webp`) : 'https://brucecoughlin.com/data/default_artwork/music_ph.png';

            albumData.songs = albumItem.songs.map((filepath) =>
            {
                const { title, rawDuration, track, artists, playCount } = songMetadata.get(filepath);

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