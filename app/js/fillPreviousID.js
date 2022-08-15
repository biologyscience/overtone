const { existsSync, readFileSync } = require('fs');

if (existsSync('app/config.json'))
{
    const config = JSON.parse(readFileSync('app/config.json'));

    if (config.discordAppID !== undefined)
    {
        const discordAppID = document.getElementById('discordAppID');

        discordAppID.value = config.discordAppID;
    }
}