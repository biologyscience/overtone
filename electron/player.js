const { ipcMain } = require('electron');
const { readFileSync } = require('fs');
const path = require('path');

const { appdata } = require('./util');
const rpc = require('./rpc');

class Player
{
    constructor(WINDOW)
    {
        this.window = WINDOW;
        this.queue = [];
        this.queueName = '';
        this.currentQueueItem = 0;
        this.ended = true;
        this.shuffle = false;
        this.repeat = false;
        this.stopAfter = null;
        this.stopped = false;
        this.playUpcoming = false;
    }

    reset()
    {
        this.queue = [];
        this.queueName = '';
        this.currentQueueItem = 0;
        this.ended = true;
        this.shuffle = false;
        this.repeat = false;
        this.stopAfter = null;
        this.stopped = false;
        this.playUpcoming = false;
    }

    setNowPlaying(filepath, autoPlay, songMetadata)
    {
        this.ended = false;
        this.stopped = false;

        if (filepath === undefined) return this;

        if (songMetadata === undefined) songMetadata = appdata.get('songMetadata');
    
        const { title, artists, album, rawDuration, albumID, isFavorite } = songMetadata[filepath];

        const data =
        {
            title,
            artists,
            album,
            duration: rawDuration,
            albumart: 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png',
            filepath,
            autoPlay: autoPlay || false,
            isFavorite
        };

        const albumData = appdata.get('albums')?.[albumID];

        if (albumData?.hasArt)
        {
            const picturePath = path.join(__dirname, `./appdata/webp/${albumID}.webp`);
            
            data.albumart = `data:image/webp;base64,${readFileSync(picturePath).toString('base64')}`;

            data.colors = albumData.colors;
        }

        this.window.webContents.send('ipc-setNowPlaying', data);
        this.window.webContents.send('ipc-playingQueueName', this.queueName);
        this.window.webContents.send('ipc-playingTrackNumber', this.currentQueueItem);

        const config = appdata.get('config');

        config.lastQueueState.queue = this.queueName;
        config.lastQueueState.track = this.currentQueueItem;
        config.lastQueueState.duration = 0;

        appdata.set('config', config);

        rpc.set({title, album, artists, albumartURL: albumData?.albumartURL});

        return this;
    }

    switchTo(name, index)
    {
        if (name)
        {
            const queues = appdata.get('queues');
    
            this.queue = queues.find(x => x.name === name).songs;
            this.queueName = name;
            this.currentQueueItem = index;
    
            this.setNowPlaying(this.queue[this.currentQueueItem], true).saveQueue({currentTrack: index});
        }

        else this.stopped = true;
        
        return this;
    }

    saveQueue({queues, position, currentTrack})
    {
        if (queues === undefined) queues = appdata.get('queues');

        const oldQueue = queues.find(x => x.name === this.queueName);

        if (oldQueue === undefined) queues.push({name: this.queueName, songs: this.queue, queuePosition: position || queues.length, currentSong: currentTrack || 0});

        else
        {
            const index = queues.indexOf(oldQueue);

            queues[index].songs = this.queue;
            queues[index].currentSong = currentTrack || 0;
        }

        appdata.set('queues', queues);

        return this;
    }
    
    actuallyNext()
    {
        const queues = appdata.get('queues');

        const { queuePosition } = queues.find(x => x.name === this.queueName);
    
        if (this.currentQueueItem + 1 === this.queue.length)
        {
            if (queuePosition + 1 === queues.length)
            {
                this.ended = true;

                return this;
            }
    
            const nextQueue = queues.find(x => x.queuePosition === queuePosition + 1);
    
            this.currentQueueItem = 0;
            this.queue = nextQueue.songs;
            this.queueName = nextQueue.name;
        }
    
        else { this.currentQueueItem++; }

        return this;
    }

    next({ot_auto})
    {
        const queues = appdata.get('queues');

        if (ot_auto)
        {
            if (this.playUpcoming)
            {
                this.switchTo('Upcoming Songs', 0).playUpcoming = false;

                return this;
            }

            if (this.stopAfter === this.queue[this.currentQueueItem])
            {
                this.stopAfter = null;
                this.stopped = true;
                
                return this;
            }

            if (this.repeat)
            {
                // do nothing
            }

            else if (this.shuffle && (this.queue.length > 1))
            {
                let random;

                do { random = Math.floor(Math.random() * this.queue.length) } while (random === this.currentQueueItem);

                this.currentQueueItem = random;
            }

            else if (this.actuallyNext().ended) return this;
        }

        else if (this.actuallyNext().ended) return this;

        this.saveQueue({queues, currentTrack: this.currentQueueItem}).setNowPlaying(this.queue[this.currentQueueItem], true);

        return this;
    }

    previous()
    {
        const queues = appdata.get('queues');

        const { queuePosition } = queues.find(x => x.name === this.queueName);

        if ((this.currentQueueItem === 0) && (queuePosition !== 0))
        {
            const previousQueue = queues.find(x => x.queuePosition === queuePosition - 1);

            this.currentQueueItem = previousQueue.songs.length - 1;
            this.queue = previousQueue.songs;
            this.queueName = previousQueue.name;
        }
        
        else { this.currentQueueItem--; }

        this.saveQueue({queues, currentTrack: this.currentQueueItem}).setNowPlaying(this.queue[this.currentQueueItem], true);

        return this;
    }

    setQueue(files, current, name)
    {
        this.queue = [...files];
        this.currentQueueItem = current;
        this.queueName = name;

        return this;
    }

    reorderQueue(name, oldOrder, newOrder)
    {
        if (name === undefined) return;

        const queues = appdata.get('queues');

        const oldQueue = queues.find(x => x.name === name);

        const index = queues.indexOf(oldQueue);

        const mapped = {};
        oldOrder.forEach((x, i) => mapped[x] = oldQueue.songs[i]);
        const reOrdered = newOrder.map(x => mapped[x]);

        queues[index].songs = reOrdered;
        queues[index].currentSong = reOrdered.indexOf(oldQueue.songs[oldQueue.currentSong]);

        if (name === this.queueName)
        {
            this.currentQueueItem = reOrdered.indexOf(this.queue[this.currentQueueItem]);
            this.queue = reOrdered;
        }

        appdata.set('queues', queues);

        return this;
    }

    addToQueue(name, file)
    {
        const queues = appdata.get('queues');

        const index = queues.indexOf(queues.find(x => x.name === name));

        queues[index].songs.push(file);

        if (name === this.queueName) this.queue.push(file);

        appdata.set('queues', queues);

        return this;
    }

    removeFromQueue(file)
    {
        return;

        const index = this.queue.indexOf(file);

        if (index === -1) return this;

        this.queue.splice(index, 1);

        if (index === this.currentQueueItem) this.setNowPlaying(this.queue[this.currentQueueItem], true);

        if (index < this.currentQueueItem) this.currentQueueItem--;

        this.saveQueue();

        return this;
    }
}

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

const audioPlayer = new Player();

ipcMain.on('WINDOW_OBJECT', obj => audioPlayer.window = obj);

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

    if (ended || audioPlayer.stopped) return false;

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

    config.audio.shuffle = audioPlayer.shuffle;
    config.audio.repeat = audioPlayer.repeat;

    appdata.set('config', config);
});

ipcMain.on('ipc-stopAfter', (E, filepath) =>
{
    audioPlayer.stopAfter = filepath;
});

ipcMain.handle('ipc-upcomingSongs', (E, {files}) =>
{
    audioPlayer.playUpcoming = true;

    const queues = appdata.get('queues');

    const oldQueue = queues.find(x => x.name === 'Upcoming Songs');

    if (oldQueue === undefined) queues.push({name: 'Upcoming Songs', songs: files, queuePosition: queues.length, currentSong: 0});

    else
    {
        oldQueue.songs = files;
        oldQueue.currentSong = 0;
    }

    appdata.set('queues', queues);

    return true;
});

module.exports = audioPlayer;