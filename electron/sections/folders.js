const { ipcMain, dialog } = require('electron');
const metadata = require('music-metadata'); // cannot write and cannot read genre properly
const { existsSync, readdirSync, statSync, unlinkSync } = require('fs');
const { moveFileSync } = require('move-file');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const { Vibrant } = require('node-vibrant/node');

const { appdata, parseTime } = require('../util');
const { getArtistPicture, getAlbumArtURL } = require('../spotify');
const audioPlayer = require('../player');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

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

    function alphabeticalOrder(a, b) { return path.basename(a).localeCompare(path.basename(b)) }

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

            if (existsSync(path.join(__dirname, `../appdata/webp/${ID}.webp`))) return true;
    
            pendingPromises.push(
                sharp(BUFFER)
                .resize({height: 1000})
                .webp({quality: 70})
                .toFile(path.join(__dirname, `../appdata/webp/${ID}.webp`))
            );

            return true;
        }

        for (let i = 0; i < results.length; i++)
        {
            const { album, artists, genre, title, track, bpm, year, picture } = results[i].common;

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

            if (!existsSync(path.join(__dirname, `../appdata/webp/${artistID}.webp`)))
            {
                getArtistPicture(artists[0]).then(({data}) =>
                {
                    if (data !== null)
                    {
                        pendingPromises.push(
                            sharp(data)
                            .webp({quality: 70})
                            .toFile(path.join(__dirname, `../appdata/webp/${artistID}.webp`))
                        );
                    }
                });
            }

            const data = { albumID, album, artists, bpm, genre: genre.flatMap(x => x.split(/[,\.;:\/]+/).map(y => y.trim()).filter(Boolean)), title, track, year, duration: parseTime(results[i].format.duration).text, rawDuration: results[i].format.duration, playCount: 0 };

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
    
    return songList[folder]?.map((file) =>
    {
        const { title, artists, album, rawDuration } = songMetadata[file];

        return { artist: artists.join(', '), location: file, duration: rawDuration, title, album };
    });
});

ipcMain.on('ipc-favoriteSong', (E, {filepath, isFavorite}) =>
{
    const songMetadata = appdata.get('songMetadata');

    songMetadata[filepath].isFavorite = isFavorite;

    appdata.set('songMetadata', songMetadata);
});

ipcMain.handle('ipc-deleteFiles', async (E, {files}) =>
{
    const albums = appdata.get('albums');
    const config = appdata.get('config');
    const queues = appdata.get('queues');
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');

    let playingQueueAffected = false;
    
    files.forEach((file) =>
    {
        if (audioPlayer.queue.includes(file)) playingQueueAffected = true;

        for (const albumID in albums)
        {
            if (albums[albumID].songs.includes(file))
            {
                albums[albumID].songs.splice(albums[albumID].songs.indexOf(file), 1);

                if (albums[albumID].songs.length === 0)
                {
                    if (albums[albumID].hasArt) unlinkSync(path.join(__dirname, `../appdata/webp/${albumID}.webp`));

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

    if (playingQueueAffected)
    {
        const queue = queues.find(x => x.name === audioPlayer.queueName);

        if (files.includes(audioPlayer.queue[audioPlayer.currentQueueItem]))
        {
            audioPlayer
            .setQueue(queue.songs, queue.currentSong, queue.name)
            .setNowPlaying(queue.songs[queue.currentSong], true, songMetadata);
        }

        else audioPlayer.setQueue(queue.songs, queue.currentSong, queue.name);
    }

    appdata.set('albums', albums);
    appdata.set('config', config);
    appdata.set('queues', queues);
    appdata.set('songList', songList);
    appdata.set('songMetadata', songMetadata);
    
    return true;
});

ipcMain.on('ipc-moveToFolder', (E, {files, toastEvent}) =>
{
    const location = dialog.showOpenDialogSync(WINDOW, {title: 'Move songs to folder', defaultPath: files[0], properties: ['openDirectory']});

    if (location === undefined) return;

    if (path.dirname(files[0]) === location[0]) return WINDOW.webContents.send(toastEvent, { text: 'No files were moved (same folder selected)' });

    const albums = appdata.get('albums');
    const config = appdata.get('config');
    const queues = appdata.get('queues');
    const songList = appdata.get('songList');
    const songMetadata = appdata.get('songMetadata');

    if (!config.checkMusicIn.includes(location[0])) config.checkMusicIn.push(location[0]);

    files.forEach((oldLocation) =>
    {
        const newLocation = path.join(location[0], path.basename(oldLocation));

        const oldMetadata = songMetadata[oldLocation];

        const album = albums[oldMetadata.albumID];
        album.songs.splice(album.songs.indexOf(oldLocation), 1, newLocation);

        for (let i = 0; i < queues.length; i++)
        {
            if (!queues[i].songs.includes(oldLocation)) continue;

            queues[i].songs.splice(queues[i].songs.indexOf(oldLocation), 1, newLocation);
        }

        if (audioPlayer.queue.includes(oldLocation)) audioPlayer.queue.splice(audioPlayer.queue.indexOf(oldLocation), 1, newLocation);

        if (songList[location[0]] === undefined) songList[location[0]] = [newLocation];
        else songList[location[0]].push(newLocation);

        const oldFolderpath = path.dirname(oldLocation);
        const oldFolder = songList[oldFolderpath];

        oldFolder.splice(oldFolder.indexOf(oldLocation), 1);

        if (oldFolder.length === 0)
        {
            config.checkMusicIn.splice(config.checkMusicIn.indexOf(oldFolderpath), 1);
            delete songList[oldFolderpath];
        }

        songMetadata[newLocation] = oldMetadata;
        delete songMetadata[oldLocation];

        moveFileSync(oldLocation, newLocation);
    });

    songList[location[0]].sort((x, y) => path.basename(x).localeCompare(path.basename(y)));

    appdata.set('albums', albums);
    appdata.set('config', config);
    appdata.set('queues', queues);
    appdata.set('songList', songList);
    appdata.set('songMetadata', songMetadata);

    WINDOW.webContents.send(toastEvent, {type: 'success', text: `${files.length} ${files.length > 1 ? 'songs were' : 'song was'} moved to ${location[0]}`});

    if (toastEvent.includes('folder')) WINDOW.webContents.send('ipc-folderReload');
});

ipcMain.on('ipc-showFile', (E, filepath) => shell.showItemInFolder(filepath));