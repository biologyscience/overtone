const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron');
const metadata = require('music-metadata');
const { mkdirSync, existsSync, writeFileSync, readdirSync, statSync } = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

const { appdata, parseTime } = require('./util');
const { getArtistPicture } = require('./spotify');
const Player = require('./player');

const audioPlayer = new Player();

let WINDOW = null;

function init()
{
    if (!existsSync(path.join(__dirname, './appdata/'))) mkdirSync(path.join(__dirname, './appdata/'));
    if (!existsSync(path.join(__dirname, './appdata/webp'))) mkdirSync(path.join(__dirname, './appdata/webp'));
    
    ['config', 'queues', 'songList', 'songMetadata'].forEach((x) =>
    {
        const filepath = path.join(__dirname, `./appdata/${x}.json`);
    
        let data = {};
    
        if (existsSync(filepath)) return;
    
        if (x === 'config')
        {
            data =
            {
                allowedMusicFileFormats: ['mp3', 'flac', 'ogg'],
                font: 'Fira',
                volume: 1,
                discordAppID: '1312407617540456458',
                discordRPCconnect: false,
                checkMusicIn: [],
                lastQueueState: {}
            };
        }

        if (x === 'queues') data = [];
    
        writeFileSync(filepath, JSON.stringify(data, null, 4));
    });
}

ipcMain.handle('ipc-wantFolders', () => 
{
    const { checkMusicIn } = appdata.get('config');

    return [...checkMusicIn];
});

ipcMain.handle('ipc-deleteFolders', (E, toDelete) => 
{   
    const config = appdata.get('config');

    toDelete.forEach((x) =>
    {
        const index = config.checkMusicIn.indexOf(x);

        if (index !== -1) config.checkMusicIn.splice(index, 1);
        
        else
        {
            // send error
        }
    });

    appdata.set('config', config);

    return [...config.checkMusicIn];
});

ipcMain.handle('ipc-addFolders', () =>
{
    const dirs = dialog.showOpenDialogSync(WINDOW, { properties: ['openDirectory', 'multiSelections'] });

    if (dirs === undefined) return [];

    const filtered = [];

    while (dirs.length > 0)
    {
        const folder = dirs.shift();

        const files = readdirSync(folder).filter(x => !statSync(path.join(folder, x)).isDirectory());

        for (const file of files)
        {
            if (/\.(mp3|flac|ogg)$/i.test(file))
            {
                filtered.push(folder);
                break;
            }
        }

        readdirSync(folder).filter(x => statSync(path.join(folder, x)).isDirectory()).forEach(y => dirs.push(path.join(folder, y)));
    }

    function alphabeticalOrder(a, b) { return a.split('/').pop().split('\\').pop().localeCompare(b.split('/').pop().split('\\').pop()) }

    const config = appdata.get('config');
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');

    const newFolders = filtered.filter(x => !config.checkMusicIn.includes(x));
    let newSongs = [];
    
    newFolders.forEach((dir) =>
    {
        const songListInFolder = readdirSync(dir)
        .filter(a => !statSync(path.join(dir, a)).isDirectory())
        .filter(x => /\.(mp3|flac|ogg)$/i.test(x))
        .map(b => path.join(dir, b));

        newSongs = newSongs.concat(songListInFolder).sort(alphabeticalOrder);

        songList[dir] = [...songListInFolder];
    });

    appdata.set('songList', songList);
    
    Promise.all(newSongs.map(x => metadata.parseFile(x, {skipPostHeaders: true}))).then(async (results) =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const { album, albumartist, artists, bpm, disk, genre, title, track, year, picture } = results[i].common;

            const data = { album, albumartist, artists, bpm, disk, genre, title, track, year, duration: parseTime(results[i].format.duration).text, rawDuration: results[i].format.duration };
            
            const albumartID = crypto.createHash('md5').update(`${album}_${albumartist}`).digest('hex');
            const artistID = crypto.createHash('md5').update(artists[0]).digest('hex');
            
            if (existsSync(path.join(__dirname, `./appdata/webp/${albumartID}.webp`))) data.albumartID = albumartID;

            if (!existsSync(path.join(__dirname, `./appdata/webp/${albumartID}.webp`)) && (picture[0] !== undefined))
            {
                data.albumartID = albumartID;

                await sharp(picture[0].data).resize({height: 1000}).webp({quality: 70}).toFile(path.join(__dirname, `./appdata/webp/${albumartID}.webp`));                
            }

            if (!existsSync(path.join(__dirname, `./appdata/webp/${artistID}.webp`)))
            {
                const { data } = await getArtistPicture(artists[0]);

                if (data !== null) await sharp(data).webp({quality: 70}).toFile(path.join(__dirname, `./appdata/webp/${artistID}.webp`));
            }

            songMetadata[newSongs[i]] = data;
        }

        appdata.set('songMetadata', songMetadata);
    });

    const newList = config.checkMusicIn.concat(newFolders).sort(alphabeticalOrder);

    config.checkMusicIn = newList;

    appdata.set('config', config);

    return [...config.checkMusicIn];
});

ipcMain.handle('ipc-wantFolder', (E, folder) =>
{
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');
    
    return songList[folder].map((file) =>
    {
        const { title, artists, album, rawDuration } = songMetadata[file];

        return { artist: artists.join(', '), location: file, duration: rawDuration, title, album };
    });
});

ipcMain.handle('ipc-wantAlbums', () =>
{
    const songMetadata = appdata.get('songMetadata');

    const albums = [];

    for (const filepath in songMetadata)
    {
        let albumart = 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

        const { album, albumartist, albumartID } = songMetadata[filepath];

        if (albumartID !== undefined) albumart = path.join(__dirname, `./appdata/webp/${albumartID}.webp`);

        albums.push(JSON.stringify({album, artist: albumartist, albumart}));
    }

    const unique = [...new Set(albums)].map(JSON.parse);
    
    return [...unique];
});

ipcMain.handle('ipc-wantAlbum', (E, {album, artist}) =>
{
    const songMetadata = appdata.get('songMetadata');

    const albumData = { album, artist, songs: [] };

    for (const filepath in songMetadata)
    {
        if ((songMetadata[filepath].album !== album) || (songMetadata[filepath].albumartist !== artist)) continue;

        const { title, rawDuration, track, artists, year, albumartID } = songMetadata[filepath];

        if (albumData.year === undefined && year !== undefined) albumData.year = year;
        if (albumData.albumart === undefined && albumartID !== undefined) albumData.albumart = path.join(__dirname, `./appdata/webp/${albumartID}.webp`);

        albumData.songs.push({
            title,
            artists,
            duration: rawDuration,
            location: filepath,
            track: track?.no || 0,
            plays: Math.floor(Math.random() * 10)
        });
    }

    if (albumData.albumart === undefined) albumData.albumart = 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

    return albumData;
});

ipcMain.handle('ipc-wantArtists', () =>
{
    const songMetadata = appdata.get('songMetadata');

    const artists = [];

    for (const filepath in songMetadata) artists.push(songMetadata[filepath].artists[0]);

    const unique = [...new Set(artists)].map((artist) =>
    {
        const picturePath = path.join(__dirname, `./appdata/webp/${crypto.createHash('md5').update(artist).digest('hex')}.webp`)

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
        if (songMetadata[filepath].artists[0] !== artist) continue;

        const { album, year, albumartID } = songMetadata[filepath];

        if (albums?.[album]?.year === undefined && year !== undefined) albums[album] === undefined ? albums[album] = { year } : albums[album].year = year;
        if (albums?.[album]?.albumart === undefined && albumartID !== undefined) albums[album] === undefined ? albums[album] = { albumart: path.join(__dirname, `./appdata/webp/${albumartID}.webp`) } : albums[album].albumart = path.join(__dirname, `./appdata/webp/${albumartID}.webp`);
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

    const picturePath = path.join(__dirname, `./appdata/webp/${crypto.createHash('md5').update(artist).digest('hex')}.webp`)

    const picture = existsSync(picturePath) ? picturePath : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

    return { picture, albums: toSend };
});

ipcMain.on('ipc-displayRightReady', (E, isReady) =>
{
    if (!isReady) return;

    const filepath = 'C:\\Files\\Music\\gigolo.mp3';

    audioPlayer.setNowPlaying(filepath, false);
});

ipcMain.handle('ipc-wantQueues', () =>
{
    const queues = appdata.get('queues');

    if (queues[0] === undefined) return [];

    return [...queues.sort((x, y) => x.queuePosition - y.queuePosition).map(z => z.name)];
});

function wantQueue(queue)
{
    const queues = appdata.get('queues');
    const songMetadata = appdata.get('songMetadata');

    const { songs, currentSong } = queues.find(x => x.name === queue);

    const songList = songs.map((x) =>
    {
        const { title, artists, album, duration, rawDuration } = songMetadata[x];

        return { title, artists, album, duration, rawDuration };
    });
    
    let totalTime = 0; songList.forEach(({rawDuration}) => totalTime += rawDuration);

    return {queueName: queue, songs: songList, trackNumber: currentSong, duration: parseTime(totalTime).text};
}

ipcMain.on('ipc-wantQueue', (E, queue) =>
{
    const data = wantQueue(queue);

    WINDOW.webContents.send('ipc-setCurrentQueue', data);
});

ipcMain.on('ipc-addQueue', (E, {album: ALBUM, artist, trackNumber}) =>
{
    const songMetadata = appdata.get('songMetadata');

    const songsByYear = {};
    const years = [];

    for (const filepath in songMetadata)
    {
        if (ALBUM === undefined)
        {
            if (songMetadata[filepath].artists[0] !== artist) continue;

            const { title, artists, album, duration, rawDuration, year, track } = songMetadata[filepath];

            if (songsByYear[year] === undefined) songsByYear[year] = [];

            songsByYear[year].push({title, artists, album, duration, rawDuration, track, filepath});
        }

        else
        {
            if ((songMetadata[filepath].album !== ALBUM) || (songMetadata[filepath].artists[0] !== artist)) continue;

            const { title, artists, album, duration, rawDuration, year, track } = songMetadata[filepath];

            if (songsByYear[year] === undefined) songsByYear[year] = [];

            songsByYear[year].push({title, artists, album, duration, rawDuration, track, filepath});
        }
    }

    for (const year in songsByYear)
    {
        years.push(year);

        songsByYear[year].sort((x, y) => x.track?.no - y.track?.no);
    }

    const songList = years.sort((x, y) => y - x).map(x => songsByYear[x]).flat();
    const queueName = ALBUM || artist;

    let totalTime = 0; songList.forEach(({rawDuration}) => totalTime += rawDuration);
    
    WINDOW.webContents.send('ipc-setCurrentQueue', {queueName, songs: songList, trackNumber, duration: parseTime(totalTime).text});

    const files = [...songList].map(x => x.filepath);

    audioPlayer.setQueue(files, trackNumber, queueName).saveQueue({currentTrack: trackNumber});
});

ipcMain.handle('ipc-audioPlayer-next', () =>
{
    const { queueName } = audioPlayer;
    const { ended, queueName: newQueueName, currentQueueItem } = audioPlayer.next();
    
    if (queueName !== newQueueName)
    {
        const data = wantQueue(newQueueName);

        data.trackNumber = currentQueueItem;
    
        WINDOW.webContents.send('ipc-setCurrentQueue', data);
    }

    if (ended) return false;

    return true;
});

ipcMain.on('ipc-audioPlayer-previous', () =>
{
    const { queueName } = audioPlayer;
    const { queueName: newQueueName, currentQueueItem } = audioPlayer.previous();

    if (queueName !== newQueueName)
    {
        const data = wantQueue(newQueueName);

        data.trackNumber = currentQueueItem;
    
        WINDOW.webContents.send('ipc-setCurrentQueue', data);
    }
});

ipcMain.on('ipc-audioPlayer-switchToTrack', (E, {queueName, index}) =>
{
    audioPlayer.switchTo(queueName, index);
});

ipcMain.on('ipc-reorderQueue', (E, {queueName, oldOrder, newOrder}) =>
{
    audioPlayer.reorderQueue(queueName, oldOrder, newOrder);

    WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(queueName));
});

ipcMain.on('ipc-reorderQueues', (E, {oldOrder, newOrder}) =>
{
    const queues = appdata.get('queues');

    const queueNames = queues.sort((x, y) => x.queuePosition - y.queuePosition).map(x => x.name);

    const mapped = {};
    oldOrder.forEach((x, i) => mapped[x] = queueNames[i]);
    const reOrdered = newOrder.map(x => mapped[x]);

    queues.forEach((x, i) => queues[i].queuePosition = reOrdered.indexOf(x.name));

    appdata.set('queues', queues);
});

app.on('ready', () =>
{
    WINDOW = new BrowserWindow
    ({
        width: 1920 / 1.5,
        height: 1200 / 1.5,
        frame: false,
        title: 'OverTone',
        icon: `${__dirname}/logo.png`,
        webPreferences:
        {
            webSecurity: false,
            nodeIntegration: false,
            contextIsolation: true,
            preload: `${__dirname}/preload.js`,
        }
    });

    init();

    audioPlayer.window = WINDOW;

    if (process.argv.includes('--file')) WINDOW.loadFile('../react/dist/index.html');
    else WINDOW.loadURL('http://localhost:8520');

    ipcMain.on('ipc-minimize', () => WINDOW.minimize());
    ipcMain.on('ipc-maximize', () => WINDOW.maximize());
    ipcMain.on('ipc-close', () => WINDOW.close());

    protocol.handle('music', (request) =>
    {
        const { pathname } = new URL(request.url);

        return net.fetch(pathname.slice(1));
    });
});