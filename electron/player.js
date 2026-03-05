const { ipcMain } = require('electron');
const { readFileSync } = require('fs');
const path = require('path');

const { parseTime } = require('./util');
const rpc = require('./rpc');

let albums, config, queues, songMetadata;

class Player
{
    constructor(WINDOW)
    {
        this.reset();
        this.window = WINDOW;
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

    setNowPlaying(filepath, autoPlay)
    {
        this.ended = false;
        this.stopped = false;

        if (filepath === undefined) return this;
    
        const { title, artists, album, rawDuration, albumID, isFavorite } = songMetadata.get(filepath);

        const data =
        {
            title,
            artists,
            album,
            duration: rawDuration,
            albumart: 'https://brucecoughlin.com/data/default_artwork/music_ph.png',
            filepath,
            autoPlay: autoPlay || false,
            isFavorite
        };

        const albumData = albums.get(albumID);

        if (albumData?.hasArt)
        {
            const picturePath = path.join(__dirname, `./appdata/webp/${albumID}.webp`);
            
            data.albumart = `data:image/webp;base64,${readFileSync(picturePath).toString('base64')}`;

            data.colors = albumData.colors;
        }

        this.window.webContents.send('ipc-setNowPlaying', data);
        this.window.webContents.send('ipc-setPlayingQueueData', {queueName: this.queueName, trackNumber: this.currentQueueItem});

        config.set('lastQueueState.queue', this.queueName);
        config.set('lastQueueState.track', this.currentQueueItem);
        config.set('lastQueueState.duration', 0);

        rpc.set({title, album, artists, albumartURL: albumData?.albumartURL});

        return this;
    }

    switchTo(name, index)
    {
        if (name)
        {
            this.queue = queues.get(name).songs;
            this.queueName = name;
            this.currentQueueItem = index;
    
            this.setNowPlaying(this.queue[this.currentQueueItem], true).saveQueue({currentTrack: index});
        }

        else this.stopped = true;
        
        return this;
    }

    saveQueue({position, currentTrack})
    {
        const queue = queues.get(this.queueName, {});

        if (queue.queuePosition === undefined) queue.queuePosition = position || Object.keys(queues.store).length;
        
        queue.songs = this.queue;
        queue.currentSong = currentTrack || 0;

        queues.set(this.queueName, queue);

        return this;
    }
    
    actuallyNext()
    {
        if (this.currentQueueItem + 1 === this.queue.length)
        {
            let nextQueueName = null;

            for (const queueNames in queues.store)
            {
                if (queues.get(queueNames).queuePosition === queues.get(this.queueName).queuePosition + 1)
                {
                    nextQueueName = queueNames;
                    break;
                }
            }

            if (nextQueueName === null)
            {
                this.ended = true;

                return this;
            }
    
            const nextQueue = queues.get(nextQueueName);
    
            this.currentQueueItem = 0;
            this.queue = nextQueue.songs;
            this.queueName = nextQueue.name;
        }
    
        else { this.currentQueueItem++; }

        return this;
    }

    next({ot_auto})
    {
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

        this.saveQueue({currentTrack: this.currentQueueItem}).setNowPlaying(this.queue[this.currentQueueItem], true);

        return this;
    }

    previous()
    {
        const { queuePosition } = queues.get(this.queueName);

        if ((this.currentQueueItem === 0) && (queuePosition !== 0))
        {
            let previousQueueName;

            for (const queueNames in queues.store)
            {
                if (queues.get(queueNames).queuePosition === queuePosition - 1)
                {
                    previousQueueName = queueNames;
                    break;
                }
            }
    
            const previousQueue = queues.get(previousQueueName);
    
            this.currentQueueItem = previousQueue.songs.length - 1;
            this.queue = previousQueue.songs;
            this.queueName = previousQueue.name;
        }
        
        else { this.currentQueueItem--; }

        this.saveQueue({currentTrack: this.currentQueueItem}).setNowPlaying(this.queue[this.currentQueueItem], true);

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

        const queue = queues.get(name);

        const mapped = {};
        oldOrder.forEach((x, i) => mapped[x] = queue.songs[i]);
        const reOrdered = newOrder.map(x => mapped[x]);

        queue.songs = reOrdered;
        queue.currentSong = reOrdered.indexOf(queue.songs[queue.currentSong]);

        if (name === this.queueName)
        {
            this.currentQueueItem = reOrdered.indexOf(this.queue[this.currentQueueItem]);
            this.queue = reOrdered;
        }

        queues.set(name, queue);

        return this;
    }

    addToQueue(name, file)
    {
        const queue = queues.get(name);

        queue.songs.push(file);

        if (name === this.queueName) this.queue.push(file);

        queues.set(name, queue);

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
    const { songs, currentSong } = queues.get(queue);

    const songList = songs.map((filepath) =>
    {
        const { title, artists, album, duration, rawDuration } = songMetadata.store[filepath];

        return { title, artists, album, duration, rawDuration, filepath };
    });
    
    let totalTime = 0; songList.forEach(({rawDuration}) => totalTime += rawDuration);

    return { queueName: queue, songs: songList, trackNumber: currentSong, duration: parseTime(totalTime).text };
}

const audioPlayer = new Player();

ipcMain.on('WINDOW_OBJECT', obj => audioPlayer.window = obj);

ipcMain.on('APPDATA', (obj) =>
{
    albums = obj.albums;
    config = obj.config;
    queues = obj.queues;
    songMetadata = obj.songMetadata;
});

ipcMain.handle('ipc-audioPlayer-next', (E, {ot_auto}) =>
{
    const { queueName } = audioPlayer;
    const { ended, queueName: newQueueName, currentQueueItem } = audioPlayer.next({ot_auto});
    
    if (queueName !== newQueueName)
    {
        const data = wantQueue(newQueueName);

        data.trackNumber = currentQueueItem;

        audioPlayer.window.webContents.send('ipc-setCurrentQueue', data);
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
    
        audioPlayer.window.webContents.send('ipc-setCurrentQueue', data);
    }
});

ipcMain.on('ipc-audioPlayer-switchToTrack', (E, {queueName, index}) =>
{
    audioPlayer.switchTo(queueName, index);
});

ipcMain.on('ipc-audioPlayer-shuffleRepeat', (E, {shuffle, repeat}) =>
{
    if (shuffle !== undefined) audioPlayer.shuffle = shuffle;
    if (repeat !== undefined) audioPlayer.repeat = repeat;

    config.set('audio.shuffle', audioPlayer.shuffle);
    config.set('audio.repeat', audioPlayer.repeat);
});

ipcMain.on('ipc-stopAfter', (E, filepath) =>
{
    audioPlayer.stopAfter = filepath;
});

ipcMain.handle('ipc-upcomingSongs', (E, {files}) =>
{
    audioPlayer.playUpcoming = true;

    const oldQueue = queues.get('Upcoming Songs', {});

    if (oldQueue.queuePosition === undefined) oldQueue.queuePosition = Object.keys(queues.store).length;

    oldQueue.songs = files;
    oldQueue.currentSong = 0;

    queues.set('Upcoming Songs', oldQueue);

    return true;
});

module.exports = audioPlayer;