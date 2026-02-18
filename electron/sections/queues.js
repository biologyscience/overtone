const { ipcMain, dialog } = require('electron');
const path = require('path');

const { appdata, parseTime, M3U } = require('../util');
const audioPlayer = require('../player');

let WINDOW;
ipcMain.on('WINDOW_OBJECT', obj => WINDOW = obj);

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

    return { queueName: queue, songs: songList, trackNumber: currentSong, duration: parseTime(totalTime).text };
}

ipcMain.on('ipc-wantQueue', (E, queue) =>
{
    if (queue)
    {
        const data = wantQueue(queue);

        WINDOW.webContents.send('ipc-setCurrentQueue', data);
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

    else
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

ipcMain.handle('ipc-addToQueue', (E, {name, files}) =>
{
    const queues = appdata.get('queues');

    const queue = queues.find(x => x.name === name);

    if (queue === undefined)
    {        
        queues.push({
            name,
            songs: files,
            queuePosition: queues.length,
            currentSong: 0
        });
    }

    else
    {
        queue.songs = [...queue.songs, ...files];
        
        if (audioPlayer.queueName === name) audioPlayer.queue = queue.songs;
    }

    appdata.set('queues', queues);

    return true;
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

ipcMain.on('ipc-removeFromQueue', (E, {name, files}) =>
{
    let afterQueueName = null;

    const queues = appdata.get('queues');

    const queueIndex = queues.indexOf(queues.find(x => x.name === name));

    const currentOldSong = queues[queueIndex].songs[queues[queueIndex].currentSong];

    const set = new Set(queues[queueIndex].songs);
    files.forEach(x => set.delete(x));
    queues[queueIndex].songs = [...set];

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
        const currentQueue = queues[queueIndex];

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
    }
    
    appdata.set('queues', queues);
    WINDOW.webContents.send('ipc-setCurrentQueue', wantQueue(afterQueueName || name));
});

ipcMain.on('ipc-saveAsM3U', (E, queueName) =>
{
    const queues = appdata.get('queues');

    const { songs } = queues.find(x => x.name === queueName);

    const playlist = new M3U({name: queueName, songs: songs.map(x => path.basename(x))});

    const location = dialog.showSaveDialogSync(WINDOW, {title: 'Save Playlist as M3U File', defaultPath: queueName, filters: [{extensions: ['m3u'], name: 'M3U File'}]});

    if (location === undefined) return;
    
    try
    {
        playlist.saveToFile(location);
        WINDOW.webContents.send('ipc-queuesToast', {type: 'success', text: 'File saved successfully'});
    }

    catch (E) { WINDOW.webContents.send('ipc-queuesToast', {type: 'error', text: 'Error saving the file'}); }
});