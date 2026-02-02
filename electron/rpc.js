const { Client } = require('discord-rpc');
const { appdata } = require('./util');

const { discordAppID } = appdata.get('config');

const rpc = new Client({transport: 'ipc'});

rpc.on('ready', () => console.log('RPC ready'));

class RPC
{
    constructor()
    {
        this.live = false;
        this.localhost = null;

        this.currentState = {
            details: 'Song Name',
            endTimestamp: Date.now(),
            largeImageKey: 'logo',
            largeImageText: 'Album',
            startTimestamp: Date.now(),
            state: 'Artists'
        };
    }

    async on()
    {
        try
        {
            await rpc.login({clientId: discordAppID});

            this.live = true;
        }
        catch (E) { this.live = false; }
        
        return this;
    }

    off()
    {
        this.localhost?.close();
        rpc.destroy();

        this.live = false;

        return this;
    }

    async set({title, album, artists, albumartURL})
    {
        if (!this.live) return this;

        this.currentState.details = title;
        this.currentState.largeImageKey = albumartURL || 'logo';
        this.currentState.largeImageText = album;
        this.currentState.state = artists.join(', ');

        this.currentState.startTimestamp = Date.now();
        this.currentState.endTimestamp = undefined;

        await rpc.setActivity(this.currentState);

        return this;
    }

    async setTime(seconds, toStop)
    {
        if (!this.live) return this;

        if (toStop)
        {
            this.currentState.startTimestamp = Date.now() - (seconds * 1000);
            this.currentState.endTimestamp = Date.now();
        }

        else
        {
            this.currentState.startTimestamp = Date.now() - (seconds * 1000);
            this.currentState.endTimestamp = undefined;
        }
        
        await rpc.setActivity(this.currentState);

        return this;
    }
}

module.exports = new RPC();