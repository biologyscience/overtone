const { app, BrowserWindow, ipcMain, dialog, shell, Menu, clipboard, nativeImage } = require('electron');
const metadata = require('music-metadata');
const { mkdirSync, existsSync, writeFileSync, readdirSync, statSync, unlinkSync } = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const { Vibrant } = require('node-vibrant/node');

const { appdata, parseTime, M3U } = require('./util');
const { getArtistPicture, getAlbumArtURL } = require('./spotify');
const Player = require('./player');
const rpc = require('./rpc');

const audioPlayer = new Player();

let WINDOW = null;

function init()
{
    if (!existsSync(path.join(__dirname, './appdata/'))) mkdirSync(path.join(__dirname, './appdata/'));
    if (!existsSync(path.join(__dirname, './appdata/webp'))) mkdirSync(path.join(__dirname, './appdata/webp'));
    
    ['config', 'queues', 'songList', 'albums', 'songMetadata'].forEach((x) =>
    {
        const filepath = path.join(__dirname, `./appdata/${x}.json`);
    
        let data = {};
    
        if (existsSync(filepath)) return;       
    
        if (x === 'config')
        {
            data =
            {
                allowedMusicFileFormats: ['mp3', 'wav', 'ogg', 'flac'],
                font: 'Fira',
                volume: 100,
                shuffle: false,
                repeat: false,
                discordAppID: '1312407617540456458',
                discordRPCconnect: false,
                checkMusicIn: [],
                lastQueueState: {},
                localhostPORT: 7410
            };
        }

        if (x === 'queues') data = [];
    
        writeFileSync(filepath, JSON.stringify(data, null, 4));
    });

    if (appdata.get('config').discordRPCconnect) rpc.on();
}

function exitApp({currentTime})
{
    const config = appdata.get('config');

    config.lastQueueState.duration = currentTime;

    appdata.set('config', config);

    WINDOW.close();
}

ipcMain.handle('ipc-wantFolders', () => 
{
    const { checkMusicIn } = appdata.get('config');

    return [...checkMusicIn];
});

ipcMain.handle('ipc-deleteFolders', (E, toDelete) => 
{   
    const config = appdata.get('config');
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');

    toDelete.forEach((x) =>
    {
        const index = config.checkMusicIn.indexOf(x);

        if (index !== -1)
        {
            config.checkMusicIn.splice(index, 1);

            const songsInFolder = songList[x];

            songsInFolder.forEach(y => delete songMetadata[y]);

            delete songList[x];
        }
        
        else
        {
            // send error
        }
    });

    appdata.set('config', config);
    appdata.set('songList', songList);
    appdata.set('songMetadata', songMetadata);

    return [...config.checkMusicIn];
});

function updateLibrary(dirs)
{
    const config = appdata.get('config');
    const songList = appdata.get('songList');
    const albums = appdata.get('albums');
    const songMetadata = appdata.get('songMetadata');

    if (dirs === undefined) dirs = [...config.checkMusicIn];

    const filtered = [];
    const foldersToRemove = [];

    while (dirs.length > 0)
    {
        const folder = dirs.shift();

        if (!existsSync(folder))
        {
            foldersToRemove.push(folder);
            continue;
        }

        const files = readdirSync(folder).filter(x => !statSync(path.join(folder, x)).isDirectory());

        for (const file of files)
        {
            if (new RegExp(`\\.(${config.allowedMusicFileFormats.join('|')})$`, 'i').test(file))
            {
                filtered.push(folder);
                break;
            }
        }

        if (config.checkMusicIn.includes(folder) && !filtered.includes(folder))
        {
            foldersToRemove.push(folder);
            continue;
        }

        readdirSync(folder).filter(x => statSync(path.join(folder, x)).isDirectory()).forEach((y) =>
        {
            const newDir = path.join(folder, y);

            if (!filtered.includes(newDir)) dirs.push(newDir);
        });
    }

    const foldersToAdd = filtered.filter(x => !config.checkMusicIn.includes(x));

    function alphabeticalOrder(a, b) { return a.split('/').pop().split('\\').pop().localeCompare(b.split('/').pop().split('\\').pop()) }

    const songsToAdd = [];
    const songsToRemove = new Set();

    filtered.forEach((dir) =>
    {
        const songListInFolder = readdirSync(dir)
        .filter(a => !statSync(path.join(dir, a)).isDirectory())
        .filter(x => new RegExp(`\\.(${config.allowedMusicFileFormats.join('|')})$`, 'i').test(x))
        .map(b => path.join(dir, b));

        songsToAdd.push(songListInFolder.filter(x => !songList?.[dir]?.includes(x)));
        if (songList?.[dir]?.length > 0) songList[dir].filter(x => !songListInFolder.includes(x)).forEach(x => songsToRemove.add(x));

        songList[dir] = [...songListInFolder];
    });

    const removedSongs = [];

    function removeFile(filepath)
    {
        removedSongs.push(filepath);

        const { albumID } = songMetadata[filepath];
    
        const { songs } = albums[albumID];
    
        if (songs.length > 1) albums[albumID].songs = songs.filter(x => x !== filepath);
    
        else delete albums[albumID];
    
        delete songMetadata[filepath];
    }

    foldersToRemove.forEach((folder) =>
    {
        const files = songList[folder];

        files.forEach((filepath) =>
        {
            removeFile(filepath);
            songsToRemove.delete(filepath);
        });

        delete songList[folder];
    });

    [...songsToRemove].forEach(removeFile);

    appdata.set('albums', albums);
    appdata.set('songList', songList);
    appdata.set('songMetadata', songMetadata);

    const newSongs = songsToAdd.flat();
    
    Promise.all(newSongs.map(x => metadata.parseFile(x, {skipPostHeaders: true}))).then(async (results) =>
    {
        console.log('start updating ...');

        const pendingPromises = [];

        async function saveAlbumPicture(ID, BUFFER)
        {
            albums[ID].hasArt = true;
    
            const colors = await Vibrant.from(BUFFER).getPalette();

            for (const key in colors) colors[key] = colors[key]._rgb.map(x => parseFloat(x.toFixed(3)));
    
            albums[ID].colors = colors;
            
            if (albums[ID].albumartURL === undefined)
            {
                albums[ID].albumartURL = null;

                pendingPromises.push(new Promise(async (resolve) =>
                {
                    const url = await getAlbumArtURL(albums[ID].album, albums[ID].artists[0]);

                    if (url !== undefined) albums[ID].albumartURL = url;

                    return resolve(true)
                }));
            }

            if (existsSync(path.join(__dirname, `./appdata/webp/${ID}.webp`))) return true;
    
            pendingPromises.push(
                sharp(BUFFER)
                .resize({height: 1000})
                .webp({quality: 70})
                .toFile(path.join(__dirname, `./appdata/webp/${ID}.webp`))
            );

            return true;
        }

        for (let i = 0; i < results.length; i++)
        {
            const { album, artists, genre, title, track, year, picture } = results[i].common;

            const albumID = crypto.createHash('md5').update(`${album}_${artists[0]}`).digest('hex');
            const artistID = crypto.createHash('md5').update(artists[0]).digest('hex');

            if (albums[albumID] === undefined)
            {
                albums[albumID] =
                {
                    album,
                    artists,
                    year,
                    songs: [newSongs[i]]
                };

                if (picture[0] !== undefined) await saveAlbumPicture(albumID, picture[0].data);
            }

            else
            {
                if (!albums[albumID].songs.includes(newSongs[i])) albums[albumID].songs.push(newSongs[i]);

                if (albums[albumID]?.hasArt !== true && (picture[0] !== undefined)) await saveAlbumPicture(albumID, picture[0].data);
            }

            if (!existsSync(path.join(__dirname, `./appdata/webp/${artistID}.webp`)))
            {
                getArtistPicture(artists[0]).then(({data}) =>
                {
                    if (data !== null)
                    {
                        pendingPromises.push(
                            sharp(data)
                            .webp({quality: 70})
                            .toFile(path.join(__dirname, `./appdata/webp/${artistID}.webp`))
                        );
                    }
                });
            }

            const data = { albumID, album, artists, bpm, genre, title, track, year, duration: parseTime(results[i].format.duration).text, rawDuration: results[i].format.duration, playCount: 0 };

            songMetadata[newSongs[i]] = data;
        }
        
        appdata.set('songMetadata', songMetadata);
        
        console.log('finished sync tasks');
        console.log('waiting for pending promises ... (should take a while)');
        
        appdata.set('albums', albums);

        await Promise.all(pendingPromises);

        appdata.set('songMetadata', songMetadata);
        appdata.set('albums', albums);

        console.log('pending promises complete');
    });

    const newList = config.checkMusicIn.concat(foldersToAdd).sort(alphabeticalOrder);

    config.checkMusicIn = newList;

    appdata.set('config', config);

    return {
        folders:
        {
            sorted: newList,
            added: foldersToAdd,
            removed: foldersToRemove
        },

        songs:
        {
            added: songsToAdd.flat(),
            removed: removedSongs
        }
    };
}

ipcMain.on('ipc-addFolders', () =>
{
    const dirs = dialog.showOpenDialogSync(WINDOW, { properties: ['openDirectory', 'multiSelections'] });

    if (dirs === undefined) return WINDOW.webContents.send('ipc-newFoldersFiles', {});

    const data = updateLibrary(dirs);

    WINDOW.webContents.send('ipc-newFoldersFiles',
    {
        folders: { list: data.folders.sorted, count: data.folders.added.length },
        songCount: data.songs.added.length
    });
});

ipcMain.on('ipc-updateFiles', () =>
{
    const data = updateLibrary();

    const dataToSend = 
    {
        folders: { list: data.folders.sorted, count: data.folders.added.length },
        songCount: data.songs.added.length
    };

    if (data.songs.removed > data.songs.added) dataToSend.songCount = -1 * data.songs.removed;
    if (data.folders.removed > data.folders.added) dataToSend.folders.count = -1 * data.folders.removed;

    WINDOW.webContents.send('ipc-newFoldersFiles', dataToSend);
});

ipcMain.handle('ipc-wantFolder', (E, folder) =>
{
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');

    if (folder === 'favorites')
    {
        const data = [];

        for (const file in songMetadata)
        {
            const { title, artists, album, rawDuration, isFavorite } = songMetadata[file];

            if (!isFavorite) continue;

            data.push({ artist: artists.join(', '), location: file, duration: rawDuration, title, album });
        }

        return data;
    }
    
    return songList[folder].map((file) =>
    {
        const { title, artists, album, rawDuration } = songMetadata[file];

        return { artist: artists.join(', '), location: file, duration: rawDuration, title, album };
    });
});

ipcMain.handle('ipc-wantAlbums', () =>
{
    const albums = appdata.get('albums');

    const albumData = [];

    for (const ID in albums)
    {
        let albumart = 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

        if (albums[ID].hasArt) albumart = path.join(__dirname, `./appdata/webp/${ID}.webp`);

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
            albumData.albumart = albums[ID].hasArt ? path.join(__dirname, `./appdata/webp/${ID}.webp`) : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

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
        if (!songMetadata[filepath].artists.includes(artist)) continue;

        const { album, year, albumID } = songMetadata[filepath];

        if (albums?.[album]?.year === undefined && year !== undefined) albums[album] === undefined ? albums[album] = { year } : albums[album].year = year;
        if (albums?.[album]?.albumart === undefined && albumID !== undefined) albums[album] === undefined ? albums[album] = { albumart: path.join(__dirname, `./appdata/webp/${albumID}.webp`) } : albums[album].albumart = path.join(__dirname, `./appdata/webp/${albumID}.webp`);
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

ipcMain.handle('ipc-wantGenres', () =>
{
    const songMetadata = appdata.get('songMetadata');

    const genres = [];

    for (const filepath in songMetadata) genres.push(songMetadata[filepath].genre);

    return [...new Set(genres.flat())].filter(x => x?.length > 0).map((genre) =>
    {
        const picturePath = path.join(__dirname, `./appdata/webp/${crypto.createHash('md5').update(genre).digest('hex')}.webp`)

        const picture = existsSync(picturePath) ? picturePath : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

        return { genre, picture };
    });
});

ipcMain.handle('ipc-wantGenre', (E, {genre}) =>
{
    const songMetadata = appdata.get('songMetadata');

    const genreData = { songs: [] };

    for (const filepath in songMetadata)
    {
        if (songMetadata[filepath].genre?.includes(genre))
        {
            const { title, rawDuration, track, artists, playCount } = songMetadata[filepath];
    
            genreData.songs.push({
                title,
                artists,
                duration: rawDuration,
                location: filepath,
                track: track?.no || 0,
                plays: playCount || 0
            });
        }
    }
    
    const picturePath = path.join(__dirname, `./appdata/webp/${crypto.createHash('md5').update(genre).digest('hex')}.webp`)

    genreData.picture = existsSync(picturePath) ? picturePath : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png';

    return genreData;
});

ipcMain.on('ipc-wantQueues', () =>
{
    const queues = appdata.get('queues');

    if (queues[0] === undefined) return [];

    WINDOW.webContents.send('ipc-setQueuesList', { current: audioPlayer.queueName, queues: [...queues.sort((x, y) => x.queuePosition - y.queuePosition).map(z => z.name)] });
});

ipcMain.on('ipc-deleteQueue', (E, {name}) =>
{
    const queues = appdata.get('queues');

    const index = queues.indexOf(queues.find(x => x.name === name));

    const position = queues[index].queuePosition;

    for (let i = 0; i < queues.length; i++)
    {
        if (queues[i].queuePosition <= position) continue;
        
        queues[i].queuePosition--;
    }

    queues.splice(index, 1);

    appdata.set('queues', queues);

    WINDOW.webContents.send('ipc-setQueuesList', { current: audioPlayer.queueName, queues: [...queues.sort((x, y) => x.queuePosition - y.queuePosition).map(z => z.name)] });
});

ipcMain.on('ipc-renameQueue', (E, {oldName, newName}) =>
{
    const queues = appdata.get('queues');

    for (let i = 0; i < queues.length; i++)
    {
        if (queues[i].name === oldName)
        {
            queues[i].name = newName;
            break;
        }
    }

    appdata.set('queues', queues);

    WINDOW.webContents.send('ipc-setQueuesList', { current: audioPlayer.queueName, queues: [...queues.sort((x, y) => x.queuePosition - y.queuePosition).map(z => z.name)] });
});

function wantQueue(queue)
{
    const queues = appdata.get('queues');
    const songMetadata = appdata.get('songMetadata');

    const { songs, currentSong } = queues.find(x => x.name === queue);

    const songList = songs.map((filepath) =>
    {
        const { title, artists, album, duration, rawDuration } = songMetadata[filepath];

        return { title, artists, album, duration, rawDuration, filepath };
    });
    
    let totalTime = 0; songList.forEach(({rawDuration}) => totalTime += rawDuration);

    return {queueName: queue, songs: songList, trackNumber: currentSong, duration: parseTime(totalTime).text};
}

ipcMain.on('ipc-wantQueue', (E, queue) =>
{
    const data = wantQueue(queue);

    WINDOW.webContents.send('ipc-setCurrentQueue', data);
});

ipcMain.on('ipc-saveVolume', (E, volume) =>
{
    const config = appdata.get('config');

    config.volume = volume;

    appdata.set('config', config);
});
 
ipcMain.on('ipc-displayRightReady', (E, isReady) =>
{
    if (!isReady) return;

    const { lastQueueState, volume, shuffle, repeat } = appdata.get('config');
    const queues = appdata.get('queues');

    if (lastQueueState.queue?.length > 0)
    {
        const queue = queues.find(x => x.name === lastQueueState.queue);

        WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(queue.name));
        WINDOW.webContents.send('ipc-restoreVolume', volume);
        WINDOW.webContents.send('ipc-restoreShuffleRepeat', {shuffle, repeat});
        WINDOW.webContents.send('ipc-restoreCurrentTime', lastQueueState.duration);

        audioPlayer.shuffle = shuffle;
        audioPlayer.repeat = repeat;
        audioPlayer.setQueue(queue.songs, lastQueueState.track, queue.name).setNowPlaying(queue.songs[lastQueueState.track], false);
    }
});

ipcMain.on('ipc-addQueue', (E, {albums, artist, trackNumber, songLocations, queueName}) =>
{
    const songMetadata = appdata.get('songMetadata');

    const songs = [];

    if (songLocations !== undefined)
    {
        songLocations.forEach((filepath) =>
        {
            const { title, artists, album, duration, rawDuration, track } = songMetadata[filepath];

            songs.push({ title, artists, album, duration, rawDuration, track, filepath });
        });
    }

    else // songs by artist
    {
        const albumsData = appdata.get('albums');
        
        albums.forEach((album) =>
        {
            for (const ID in albumsData)
            {
                if (albumsData[ID].album === album && albumsData[ID].artists.includes(artist))
                {
                    const data = albumsData[ID].songs.map((filepath) =>
                    {
                        const { title, artists, album, duration, rawDuration, track } = songMetadata[filepath];

                        return { title, artists, album, duration, rawDuration, track, filepath };
                    });

                    data.sort((x, y) => x.track?.no - y.track?.no);
                    data.forEach(x => songs.push(x));

                    break;
                }
            }
        });
    }

    let totalTime = 0; songs.forEach(({rawDuration}) => totalTime += rawDuration);
    
    WINDOW.webContents.send('ipc-setCurrentQueue', {queueName, songs, trackNumber, duration: parseTime(totalTime).text});

    const files = songs.map(x => x.filepath);

    audioPlayer.setQueue(files, trackNumber, queueName).saveQueue({currentTrack: trackNumber}).setNowPlaying(files[trackNumber], true);
});

ipcMain.handle('ipc-audioPlayer-next', (E, {ot_auto}) =>
{
    const { queueName } = audioPlayer;
    const { ended, queueName: newQueueName, currentQueueItem } = audioPlayer.next({ot_auto});
    
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

ipcMain.on('ipc-audioPlayer-shuffleRepeat', (E, {shuffle, repeat}) =>
{
    const config = appdata.get('config');

    if (shuffle !== undefined) audioPlayer.shuffle = shuffle;
    if (repeat !== undefined) audioPlayer.repeat = repeat;

    config.shuffle = audioPlayer.shuffle;
    config.repeat = audioPlayer.repeat;

    appdata.set('config', config);
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

ipcMain.on('ipc-setRPCtime', (E, data) =>
{
    rpc.setTime(data.time, data.stop);
});

ipcMain.on('ipc-songPlayed', (E, filepath) =>
{
    const songMetadata = appdata.get('songMetadata');

    const { playCount } = songMetadata[filepath];

    if (playCount === undefined) songMetadata[filepath].playCount = 0;
    
    songMetadata[filepath].playCount++;

    appdata.set('songMetadata', songMetadata);
});

ipcMain.on('ipc-removeFromQueue', (E, {name, position}) =>
{
    let afterQueueName = null;

    const queues = appdata.get('queues');

    const queueIndex = queues.indexOf(queues.find(x => x.name === name));

    queues[queueIndex].songs.splice(position, 1);

    if (queues[queueIndex].songs.length === 0)
    {
        const { queuePosition } = queues[queueIndex];

        queues.splice(queueIndex, 1);

        for (let i = 0; i < queues.length; i++)
        {
            if (queues[i].queuePosition === queuePosition + 1) afterQueueName = queues[i].name;

            if (queues[i].queuePosition > queuePosition) queues[i].queuePosition--;
        }
    }

    if (afterQueueName !== null) audioPlayer.switchTo(afterQueueName, 0);

    else
    {
        const currentQueue = queues.find(x => x.name === name);

        if (audioPlayer.queueName === name)
        {
            audioPlayer.queue = currentQueue.songs;

            if (audioPlayer.currentQueueItem === position) audioPlayer.setNowPlaying(audioPlayer.queue[audioPlayer.currentQueueItem]);
            
            if (audioPlayer.currentQueueItem > position)
            {
                queues[queues.indexOf(currentQueue)].currentSong--;
                audioPlayer.currentQueueItem--;
            }
        }

        else if (audioPlayer.currentQueueItem > position) queues[queues.indexOf(currentQueue)].currentSong--;
    }
    
    appdata.set('queues', queues);
    WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(afterQueueName || name));
});

ipcMain.handle('ipc-wantInfo', async (E, filepath) =>
{    
    const { format, common } = await metadata.parseFile(filepath);

    const picture = common.picture[0];
    const { playCount, isFavorite } = appdata.get('songMetadata')[filepath];

    format.size = statSync(filepath).size;
    common.picture = `data:${picture.format};base64,${picture.data.toString('base64')}`;

    const data =
    {
        file: format,
        tags: common,

        extras:
        {
            filepath,
            playCount,
            isFavorite
        }
    };

    if (picture?.data)
    {
        const colors = await Vibrant.from(picture.data).getPalette();
        for (const key in colors) colors[key] = colors[key]._rgb.map(x => parseFloat(x.toFixed(3)));

        data.extras.colors = colors;
    }

    return data;
});

ipcMain.on('ipc-showFile', (E, filepath) =>
{
    shell.showItemInFolder(filepath);
});

ipcMain.on('ipc-newWindow', (E, url) =>
{
    const imgWindow = new BrowserWindow({ width: 720, height: 720 });

    imgWindow.webContents.on('context-menu', (E, {mediaType, srcURL}) =>
    {
        const menuTemplate = [];

        if (mediaType === 'image')
        {
            menuTemplate.push({
                label: 'Save image as...',
                click: () => imgWindow.webContents.downloadURL(srcURL)
            });

            menuTemplate.push({
                label: 'Copy image',
                click: () => clipboard.writeImage(nativeImage.createFromDataURL(srcURL))
            });
        }

        Menu.buildFromTemplate(menuTemplate).popup();
    });

    let zoom = 0;

    imgWindow.webContents.on('zoom-changed', (E, direction) =>
    {
        if (direction === 'in') zoom++;
        if (direction === 'out') zoom--;

        imgWindow.webContents.setZoomLevel(zoom);
    });

    imgWindow.removeMenu();
    imgWindow.loadURL(url).then(() => imgWindow.webContents.setZoomLevel(zoom));
});

ipcMain.on('ipc-saveAsM3U', (E, queueName) =>
{
    const queues = appdata.get('queues');

    const { songs } = queues.find(x => x.name === queueName);

    const playlist = new M3U({name: queueName, songs: songs.map(x => x.split('/').pop().split('\\').pop())});

    const location = dialog.showSaveDialogSync(WINDOW, {title: 'Save Playlist as M3U File', defaultPath: queueName, filters: [{extensions: ['m3u'], name: 'M3U File'}]});

    if (location === undefined) return;
    
    try
    {
        playlist.saveToFile(location);
        WINDOW.webContents.send('ipc-queuesToast', {type: 'success', text: 'File saved successfully'});
    }

    catch (E) { WINDOW.webContents.send('ipc-queuesToast', {type: 'error', text: 'Error saving the file'}); }

});

ipcMain.on('ipc-favoriteSong', (E, {filepath, isFavorite}) =>
{
    const songMetadata = appdata.get('songMetadata');

    songMetadata[filepath].isFavorite = isFavorite;

    appdata.set('songMetadata', songMetadata);
});

ipcMain.handle('ipc-deleteFiles', (E, {files}) =>
{
    const albums = appdata.get('albums');
    const config = appdata.get('config');
    const queues = appdata.get('queues');
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');
    
    files.forEach((file) =>
    {
        for (const albumID in albums)
        {
            if (albums[albumID].songs.includes(file))
            {
                albums[albumID].songs.splice(albums[albumID].songs.indexOf(file), 1);

                if (albums[albumID].songs.length === 0)
                {
                    if (albums[albumID].hasArt) unlinkSync(path.join(__dirname, `./appdata/webp/${albumID}.webp`));

                    delete albums[albumID];
                }
                
                break;
            }
        }

        for (let i = 0; i < queues.length; i++)
        {
            if (queues[i].songs.includes(file))
            {
                queues[i].songs.splice(queues[i].songs.indexOf(file), 1);
    
                if (queues[i].currentSong >= queues[i].songs.length) queues[i].currentSong = queues[i].songs.length - 1;
            }
        }

        for (const folder in songList)
        {
            if (file.startsWith(folder))
            {
                songList[folder].splice(songList[folder].indexOf(file), 1);

                if (songList[folder].length === 0)
                {
                    config.checkMusicIn.splice(config.checkMusicIn.indexOf(folder), 1);
                    delete songList[folder];
                }

                break;
            }
        }

        delete songMetadata[file];
    
        unlinkSync(file);
    });

    appdata.set('albums', albums);
    appdata.set('config', config);
    appdata.set('queues', queues);
    appdata.set('songList', songList);
    appdata.set('songMetadata', songMetadata);
    
    return true;
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
    ipcMain.on('ipc-close', (E, data) => exitApp(data));
});