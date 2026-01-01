const path = require('path');
const { appdata } = require('./util');

class Player
{
    constructor(WINDOW)
    {
        this.window = WINDOW;
        this.queue = [];
        this.queueName = '';
        this.currentQueueItem = 0;
    }

    setNowPlaying(filepath, autoPlay, songMetadata)
    {
        if (filepath === undefined) return this;

        if (songMetadata === undefined) songMetadata = appdata.get('songMetadata');
    
        const { title, artists, album, rawDuration, albumartID } = songMetadata[filepath];

        const data =
        {
            title,
            artist: artists.join(', '),
            album,
            duration: rawDuration,
            albumart: albumartID ? path.join(__dirname, `./appdata/webp/${albumartID}.webp`) : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png',
            filepath,
            autoPlay
        };

        this.window.webContents.send('ipc-setNowPlaying', data);
    }

    switchTo(index)
    {
        this.currentQueueItem = index;
        
        this.setNowPlaying(this.queue[this.currentQueueItem], true);

        return this;
    }

    saveQueue()
    {
        const queues = appdata.get('queues');
        queues[this.queueName] = this.queue;
        appdata.set('queues', queues);

        return this;
    }

    next()
    {
        if (this.currentQueueItem + 1 === this.queue.length) return this;

        this.currentQueueItem++;

        this.setNowPlaying(this.queue[this.currentQueueItem], true);

        return this;
    }

    previous()
    {
        if (this.currentQueueItem !== 0) this.currentQueueItem--;        

        this.setNowPlaying(this.queue[this.currentQueueItem], true);

        return this;
    }

    setQueue(files, current, name)
    {
        this.queue = [...files];
        this.currentQueueItem = current;
        this.queueName = name;

        this.setNowPlaying(this.queue[this.currentQueueItem], true);

        return this;
    }

    reorderQueue(oldOrder, newOrder)
    {
        this.saveQueue();

        return this;
    }

    addToQueue(file)
    {
        this.queue.push(file);

        this.saveQueue();

        return this;
    }

    removeFromQueue(file)
    {
        const index = this.queue.indexOf(file);

        if (index === -1) return this;

        this.queue.splice(index, 1);

        if (index === this.currentQueueItem) this.setNowPlaying(this.queue[this.currentQueueItem], true);

        if (index < this.currentQueueItem) this.currentQueueItem--;

        this.saveQueue();

        return this;
    }
}

module.exports = Player;