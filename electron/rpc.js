const { ipcMain } = require('electron');
const { Client } = require('discord-rpc');

const rpcClient = new Client({transport: 'ipc'});

rpcClient.on('ready', () => console.log('RPC ready'));

class RPC
{
    constructor()
    {
        this.live = false;
        this.localhost = null;
        this.clientId = null;

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
            await rpcClient.login({clientId: this.clientId});

            this.live = true;
        }
        catch (E) { this.live = false; }
        
        return this;
    }

    async off()
    {
        this.localhost?.close();

        try { await rpcClient?.destroy(); } catch (E) {}

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

        await rpcClient.setActivity(this.currentState);

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
        
        await rpcClient.setActivity(this.currentState);

        return this;
    }
}

const rpc = new RPC();

ipcMain.on('APPDATA', ({config}) => rpc.clientId = config.get('discordRPC.appID'));

ipcMain.handle('ipc-startRPC', async (E, obj) =>
{
    if (obj?.restart)
    {
        await rpc.off();

        await new Promise(x => setTimeout(x, 1250));

        await rpc.on();

        return rpc.live;
    }

    else rpc.on();
});

ipcMain.on('ipc-setRPCtime', (E, data) =>
{
    rpc.setTime(data.time, data.stop);
});

module.exports = rpc;