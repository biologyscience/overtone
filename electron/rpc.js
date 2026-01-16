const express = require('express');
const path = require('path');
const { Client } = require('discord-rpc');
const { appdata } = require('./util');
const sharp = require('sharp');

const { discordAppID, localhostPORT } = appdata.get('config');

const app = express();
const rpc = new Client({transport: 'ipc'});

app.get('/webp/:file', (request, response) =>
{
    const file = request.params.file.split('.');
    let format = file.pop();
    const filename = file.join('.');

    if (format === undefined) return response.sendStatus(404);

    if (format === 'jpg') format = 'jpeg';

    const filePath = path.join(__dirname, `./appdata/webp/${filename}.webp`);

    response.set('Content-Type', `image/${format}`);
    response.set('Cache-Control', 'no-store');

    if (format === 'webp') sharp(filePath).resize(800, 800).webp().pipe(response);
    if (format === 'png') sharp(filePath).resize(800, 800).png().pipe(response);
    if (format === 'jpeg') sharp(filePath).resize(800, 800).jpeg().pipe(response);    
});

app.use('/webp', express.static(path.join(__dirname, './appdata/webp')));
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
        // this.localhost = app.listen(localhostPORT, () => console.log(`localhost:${localhostPORT}`));

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