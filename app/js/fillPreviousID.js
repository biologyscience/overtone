const fs = require('fs');

const discordAppID = document.getElementById('discordAppID');

if (fs.existsSync('app/config.json'))
{
    const config = JSON.parse(fs.readFileSync('app/config.json'));

    discordAppID.value = config.discordAppID;
}