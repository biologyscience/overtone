const { existsSync, readFileSync } = require('fs');

if (existsSync('app/config.json'))
{
    const discordAppID = document.getElementById('discordAppID');

    const config = JSON.parse(readFileSync('app/config.json'));

    discordAppID.value = config.discordAppID;
}