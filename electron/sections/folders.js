const { ipcMain, dialog } = require('electron');
const metadata = require('music-metadata'); // cannot write and cannot read genre properly
const { existsSync, readdirSync, statSync, unlinkSync } = require('fs');
const { moveFileSync } = require('move-file');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const { Vibrant } = require('node-vibrant/node');

const { parseTime, saveArtistPicture } = require('../util');
const audioPlayer = require('../player');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

let albums, config, queues, songList, songMetadata;
ipcMain.on('APPDATA', (obj) =>
{
    albums = obj.albums;
    config = obj.config;
    queues = obj.queues;
    songList = obj.songList;
    songMetadata = obj.songMetadata;
});

ipcMain.handle('ipc-wantFolders', () => 
{
    return config.get('checkMusicIn');
});

ipcMain.handle('ipc-deleteFolders', (E, toDelete) => 
{
    const checkMusicIn = config.get('checkMusicIn');

    toDelete.forEach((x) =>
    {
        const index = checkMusicIn.indexOf(x);

        if (index !== -1)
        {
            checkMusicIn.splice(index, 1);

            const songsInFolder = songList.get(x);

            songsInFolder.forEach(y => songMetadata.delete(y));

            songList.delete(x);
        }
        
        else
        {
            // send error
        }
    });

    config.set('checkMusicIn', checkMusicIn);

    return checkMusicIn;
});

function updateLibrary(dirs)
{
    if (dirs === undefined) dirs = config.get('checkMusicIn');

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
            if (new RegExp(`\\.(${config.get('allowedMusicFileFormats').join('|')})$`, 'i').test(file))
            {
                filtered.push(folder);
                break;
            }
        }

        if (config.get('checkMusicIn').includes(folder) && !filtered.includes(folder))
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

    const foldersToAdd = filtered.filter(x => !config.get('checkMusicIn').includes(x));

    function alphabeticalOrder(a, b) { return path.basename(a).localeCompare(path.basename(b)) }

    const songsToAdd = [];
    const songsToRemove = new Set();

    filtered.forEach((dir) =>
    {
        const songListInFolder = readdirSync(dir)
        .filter(a => !statSync(path.join(dir, a)).isDirectory())
        .filter(x => new RegExp(`\\.(${config.get('allowedMusicFileFormats').join('|')})$`, 'i').test(x))
        .map(b => path.join(dir, b));

        songsToAdd.push(songListInFolder.filter(x => !songList.get(dir)?.includes(x)));
        if (songList.get(dir)?.length > 0) songList.get(dir).filter(x => !songListInFolder.includes(x)).forEach(x => songsToRemove.add(x));

        songList.set(dir, [...songListInFolder]);
    });

    const removedSongs = [];

    function removeFile(filepath)
    {
        removedSongs.push(filepath);

        const { albumID } = songMetadata.get(filepath);
    
        const album = albums.get(albumID);
    
        if (album.songs?.length > 1)
        {
            album.songs = [...album.songs.filter(x => x !== filepath)];

            albums.set(albumID, album);
        }
    
        else delete albums.delete(albumID);
    
        songMetadata.delete(filepath);
    }

    foldersToRemove.forEach((folder) =>
    {
        const files = songList.get(folder);

        files.forEach((filepath) =>
        {
            removeFile(filepath);
            songsToRemove.delete(filepath);
        });

        songList.delete(folder);
    });

    [...songsToRemove].forEach(removeFile);

    const newSongs = songsToAdd.flat();
    
    Promise.all(newSongs.map(x => metadata.parseFile(x, {skipPostHeaders: true}))).then(async (results) =>
    {
        console.log('start updating ...');

        async function saveAlbumPicture(ID, BUFFER)
        {
            const colors = await Vibrant.from(BUFFER).getPalette();

            for (const key in colors) colors[key] = colors[key]._rgb.map(x => parseFloat(x.toFixed(3)));
    
            if (existsSync(path.join(__dirname, `../appdata/webp/${ID}.webp`))) return colors;

            sharp(BUFFER).resize({height: 1000}).webp({quality: 70}).toFile(path.join(__dirname, `../appdata/webp/${ID}.webp`))
    
            return colors;
        }

        for (let i = 0; i < results.length; i++)
        {
            const { album, artists, title, track, bpm, year, picture } = results[i].common;

            const albumID = crypto.createHash('md5').update(`${album}_${artists[0]}`).digest('hex');
            const artistID = crypto.createHash('md5').update(artists[0]).digest('hex');

            const albumData = albums.get(albumID, {});

            if (albumData.songs === undefined)
            {
                albumData.album = album;
                albumData.artists = artists;
                albumData.year = year;
                albumData.songs = [newSongs[i]];
                
                if (picture[0] !== undefined)
                {
                    const colors = await saveAlbumPicture(albumID, picture[0].data);

                    albumData.hasArt = true;
                    albumData.colors = colors;
                }
            }

            else
            {
                if (!albumData.songs.includes(newSongs[i])) albumData.songs.push(newSongs[i]);

                if (albumData?.hasArt !== true && (picture[0] !== undefined))
                {
                    const colors = await saveAlbumPicture(albumID, picture[0].data);

                    albumData.hasArt = true;
                    albumData.colors = colors;
                }
            }

            albums.set(albumID, albumData);

            if (!existsSync(path.join(__dirname, `../appdata/webp/${artistID}.webp`))) saveArtistPicture(artists[0], artistID);

            const data = { albumID, album, artists, bpm, title, track, year, duration: parseTime(results[i].format.duration).text, rawDuration: results[i].format.duration, playCount: 0 };

            songMetadata.set(newSongs[i], data);
        }

        console.log('update complete');
    });

    const newList = config.get('checkMusicIn').concat(foldersToAdd).sort(alphabeticalOrder);

    config.set('checkMusicIn', newList);

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
    if (folder === 'favorites')
    {
        const temp = [];

        const data = { ...songMetadata.store };

        for (const file in data)
        {
            const { title, artists, album, rawDuration, isFavorite } = data[file];

            if (!isFavorite) continue;

            temp.push({ artist: artists.join(', '), location: file, duration: rawDuration, title, album });
        }

        return data;
    }
    
    return songList.get(folder)?.map((file) =>
    {
        const { title, artists, album, rawDuration } = songMetadata.get(file);

        return { artist: artists.join(', '), location: file, duration: rawDuration, title, album };
    });
});

ipcMain.on('ipc-favoriteSong', (E, {filepath, isFavorite}) =>
{
    const data = songMetadata.get(filepath);
    
    data.isFavorite = isFavorite;

    songMetadata.set(filepath, data);
});

ipcMain.handle('ipc-deleteFiles', async (E, {files}) =>
{
    let playingQueueAffected = false;
    
    files.forEach((file) =>
    {
        if (audioPlayer.queue.includes(file)) playingQueueAffected = true;

        let data = { ...albums.store };

        for (const albumID in data)
        {
            const album = data[albumID];

            if (album.songs.includes(file))
            {
                album.songs.splice(albums[albumID].songs.indexOf(file), 1);
                albums.set(albumID, album);

                if (album.songs.length === 0)
                {
                    if (album.hasArt) unlinkSync(path.join(__dirname, `../appdata/webp/${albumID}.webp`));

                    albums.delete(albumID);
                }

                break;
            }
        }

        data = { ...queues.store };

        for (const queueName in data)
        {
            const queue = data[queueName];

            if (queue.songs.includes(file))
            {
                queue.songs.splice(queue.songs.indexOf(file), 1);
    
                if (queue.currentSong >= queue.songs.length) queue.currentSong = queue.songs.length - 1;

                queues.set(queueName, queue);
            }
        }

        data = { ...songList.store };

        for (const folder in data)
        {
            if (file.startsWith(folder))
            {
                const list = data[folder];

                list.splice(list.indexOf(file), 1);
                
                songList.set(folder, list);

                if (list?.length === 0)
                {
                    const checkMusicIn = config.get('checkMusicIn');
                    checkMusicIn.splice(checkMusicIn.indexOf(folder), 1);
                    config.set('checkMusicIn', checkMusicIn);

                    songList.delete(folder);
                }

                break;
            }
        }

        songMetadata.delete(file);
    
        unlinkSync(file);
    });

    if (playingQueueAffected)
    {
        const queue = queues.get(audioPlayer.queueName);

        audioPlayer.setQueue(queue.songs, queue.currentSong, audioPlayer.queueName);

        if (files.includes(audioPlayer.queue[audioPlayer.currentQueueItem])) audioPlayer.setNowPlaying(queue.songs[queue.currentSong], true);
    }

    return true;
});

ipcMain.on('ipc-moveToFolder', (E, {files, toastEvent}) =>
{
    const location = dialog.showOpenDialogSync(WINDOW, {title: 'Move songs to folder', defaultPath: files[0], properties: ['openDirectory']});

    if (location === undefined) return;

    if (path.dirname(files[0]) === location[0]) return WINDOW.webContents.send(toastEvent, { text: 'No files were moved (same folder selected)' });

    const checkMusicIn = config.get('checkMusicIn');

    if (!checkMusicIn.includes(location[0]))
    {
        checkMusicIn.push(location[0]);
        config.set('checkMusicIn', checkMusicIn);
    }

    files.forEach((oldLocation) =>
    {
        const newLocation = path.join(location[0], path.basename(oldLocation));

        const oldMetadata = songMetadata.get(oldLocation);

        const album = albums.get(oldMetadata.albumID);
        album.songs.splice(album.songs.indexOf(oldLocation), 1, newLocation);
        albums.set(oldMetadata.albumID, album);

        const data = { ...queues.store };

        for (const queueName in data)
        {
            const queue = data[queueName];

            if (!queue.songs.includes(oldLocation)) continue;

            queue.songs.splice(queue.songs.indexOf(oldLocation), 1, newLocation);

            queues.set(queueName, queue);
        }

        if (audioPlayer.queue.includes(oldLocation)) audioPlayer.queue.splice(audioPlayer.queue.indexOf(oldLocation), 1, newLocation);

        const list = songList.get(location[0], []);
        list.push(newLocation);
        songList.set(location[0], list);

        const oldFolderpath = path.dirname(oldLocation);
        const oldFolder = songList.get(oldFolderpath);

        oldFolder.splice(oldFolder.indexOf(oldLocation), 1);

        if (oldFolder.length === 0)
        {
            checkMusicIn.splice(checkMusicIn.indexOf(oldFolderpath), 1);
            config.set('checkMusicIn', checkMusicIn);

            songList.delete(oldFolderpath);
        }

        songMetadata.set(newLocation, oldMetadata);
        songMetadata.delete(oldLocation);

        moveFileSync(oldLocation, newLocation);
    });

    const list = songList.get(location[0]);
    list.sort((x, y) => path.basename(x).localeCompare(path.basename(y)));
    songList.set(location[0], list);

    WINDOW.webContents.send(toastEvent, {type: 'success', text: `${files.length} ${files.length > 1 ? 'songs were' : 'song was'} moved to ${location[0]}`});

    if (toastEvent.includes('folder')) WINDOW.webContents.send('ipc-folderReload');
});

ipcMain.on('ipc-showFile', (E, filepath) => shell.showItemInFolder(filepath));