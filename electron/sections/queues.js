const { ipcMain, dialog } = require('electron');
const path = require('path');

const { parseTime, M3U } = require('../util');
const audioPlayer = require('../player');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

let albums, config, queues, songMetadata;
ipcMain.on('APPDATA', (obj) =>
{
    albums = obj.albums;
    config = obj.config;
    queues = obj.queues;
    songMetadata = obj.songMetadata;
});

ipcMain.on('ipc-wantQueues', () =>
{
    const queueList = [];

    const data = { ...queues.store };

    for (const queueName in data) queueList[data[queueName].queuePosition] = queueName;

    WINDOW.webContents.send('ipc-setQueuesList', { current: audioPlayer.queueName, queues: queueList.filter(Boolean) });
});

ipcMain.on('ipc-deleteQueue', (E, {name}) =>
{
    const queueList = [];
    const position = queues.get(name).queuePosition;

    const data = { ...queues.store };

    for (const queueName in data)
    {
        if (queueName === name) continue;

        const queue = data[queueName];

        queueList[queue.queuePosition] = queueName;

        if (queue.queuePosition > position)
        {
            queue.queuePosition--;
            queues.set(queueName, queue);
        }
    }

    if (config.get('lastQueueState').queue === name) config.set('lastQueueState', {});

    queues.delete(name);

    WINDOW.webContents.send('ipc-setQueuesList', { current: audioPlayer.queueName, queues: queueList.filter(Boolean) });
});

ipcMain.on('ipc-renameQueue', (E, {oldName, newName}) =>
{
    if (!oldName) return;

    queues.set(newName, queues.get(oldName));
    queues.delete(oldName);

    const queueList = [];

    const data = { ...queues.store };

    for (const queueName in data) queueList[data[queueName].queuePosition] = queueName;

    WINDOW.webContents.send('ipc-setQueuesList', { current: audioPlayer.queueName, queues: queueList.filter(Boolean) });
});

function wantQueue(queue)
{
    const { songs, currentSong } = queues.get(queue);

    const data = { ...songMetadata.store };

    const songList = songs.map((filepath) =>
    {
        const { title, artists, album, duration, rawDuration } = data[filepath];

        return { title, artists, album, duration, rawDuration, filepath };
    });
    
    let totalTime = 0; songList.forEach(({rawDuration}) => totalTime += rawDuration);

    return { queueName: queue, songs: songList, trackNumber: currentSong, duration: parseTime(totalTime).text };
}


ipcMain.on('ipc-wantQueue', (E, queue) =>
{
    if (!queue) return;

    WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(queue));
});

ipcMain.on('ipc-addQueue', (E, {albums: albumList, artist, trackNumber, songLocations, queueName}) =>
{
    const songs = [];

    if (songLocations !== undefined)
    {
        songLocations.forEach((filepath) =>
        {
            const { title, artists, album, duration, rawDuration, track } = songMetadata.get(filepath);

            songs.push({ title, artists, album, duration, rawDuration, track, filepath });
        });
    }

    else
    {
        albumList.forEach((album) =>
        {
            const data = { ...albums.store };

            for (const ID in data)
            {
                const albumData = data[ID];

                if (albumData.album === album && albumData.artists.includes(artist))
                {
                    const temp = albumData.songs.map((filepath) =>
                    {
                        const { title, artists, album, duration, rawDuration, track } = songMetadata.get(filepath);

                        return { title, artists, album, duration, rawDuration, track, filepath };
                    });

                    temp.sort((x, y) => x.track?.no - y.track?.no);
                    temp.forEach(x => songs.push(x));

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

ipcMain.handle('ipc-addToQueue', (E, {name, files}) =>
{
    const queue = queues.get(name);

    if (queue === undefined) queues.set(name, {songs: files, queuePosition: Object.keys(queues.store).length, currentSong: 0});

    else
    {
        queue.songs = [...queue.songs, ...files];
        queues.set(name, queue);
        
        if (audioPlayer.queueName === name) audioPlayer.queue = queue.songs;
    }

    return true;
});

ipcMain.on('ipc-reorderQueue', (E, {queueName, oldOrder, newOrder}) =>
{
    audioPlayer.reorderQueue(queueName, oldOrder, newOrder);

    WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(queueName));
});

ipcMain.on('ipc-reorderQueues', (E, {oldOrder, newOrder}) =>
{
    const queueNames = [];
    
    const data = { ...queues.store };

    for (const queueName in data) queueNames[data[queueName].queuePosition] = queueName;

    const mapped = {};
    oldOrder.forEach((x, i) => mapped[x] = queueNames[i]);
    const reOrdered = newOrder.map(x => mapped[x]);

    queueNames.forEach((x) =>
    {
        const queue = queues.get(x);

        queue.queuePosition = reOrdered.indexOf(x);

        queues.set(x, queue);
    });
});

ipcMain.on('ipc-removeFromQueue', (E, {name, files}) =>
{
    let afterQueueName = null;

    const queue = queues.get(name);

    const currentOldSong = queue.songs[queue.currentSong];

    const set = new Set(queue.songs);
    files.forEach(x => set.delete(x));
    queue.songs = [...set];

    if (queue.songs.length === 0)
    {
        const data = { ...queues.store };

        for (const queueName in data)
        {
            const queueItem = data[queueName];

            if (queueItem.queuePosition === queue.queuePosition + 1) afterQueueName = queueName;
            if (queueItem.queuePosition > queue.queuePosition) queueItem.queuePosition--;

            queues.set(queueName, queueItem);
        }

        queues.delete(name);
    }

    if (afterQueueName !== null) audioPlayer.switchTo(afterQueueName, 0);

    else
    {
        const currentQueue = queues.get(name);

        if (audioPlayer.queueName === name)
        {
            const newPosition = currentQueue.songs.indexOf(audioPlayer.queue[audioPlayer.currentQueueItem]);

            audioPlayer.queue = currentQueue.songs;

            if (newPosition === -1)
            {
                if (audioPlayer.currentQueueItem >= audioPlayer.queue.length)
                {
                    audioPlayer.currentQueueItem = audioPlayer.queue.length - 1;
                    currentQueue.currentSong = audioPlayer.queue.length - 1;
                }

                audioPlayer.setNowPlaying(audioPlayer.queue[audioPlayer.currentQueueItem]);
            }

            else
            {
                audioPlayer.currentQueueItem = newPosition;
                currentQueue.currentSong = newPosition;
            }
        }

        else
        {
            const oldPosition = currentQueue.currentSong;
            const newPosition = currentQueue.songs.indexOf(currentOldSong);
            
            if (newPosition !== -1) currentQueue.currentSong = newPosition;
            else if (oldPosition >= currentQueue.songs.length) currentQueue.currentSong = currentQueue.songs.length - 1;
        }

        queues.set(name, currentQueue);
    }
    
    WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(afterQueueName || name));
});

ipcMain.on('ipc-saveAsM3U', (E, queueName) =>
{
    const queue = queues.get(queueName);

    const playlist = new M3U({name: queueName, songs: queue.songs.map(x => path.basename(x))});

    const location = dialog.showSaveDialogSync(WINDOW, {title: 'Save Playlist as M3U File', defaultPath: queueName, filters: [{extensions: ['m3u'], name: 'M3U File'}]});

    if (location === undefined) return;
    
    try
    {
        playlist.saveToFile(location);
        WINDOW.webContents.send('ipc-queuesToast', {type: 'success', text: 'File saved successfully'});
    }

    catch (E) { WINDOW.webContents.send('ipc-queuesToast', {type: 'error', text: 'Error saving the file'}); }
});