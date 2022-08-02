const pressence = 
{
    state: 'Name of the Song',
    details: 'Name of the Artist'
};

const connect = document.getElementById('connect');
const appID = document.getElementById('discordAppID');

function rpcStart()
{
    const ID = appID.value;

    if (ID === 0) return alert('Please enter your Discord Application ID');

    const rpc = require('discord-rpc');
    const fs = require('fs');

    const client = new rpc.Client({transport: 'ipc'});

    client.once('ready', () => client.setActivity(pressence));

    client.login({clientId: ID})
    .then((c) =>
    {
        document.dispatchEvent(new CustomEvent('-RPC', {detail: c}));

        connect.innerHTML = 'Connected';
        connect.style.borderColor = 'var(--accentGreen1)';

        let data;

        if (fs.existsSync('app/config.json'))
        {
            const config = require('../../config.json');

            config.discordAppID = ID;

            data = config;
        }

        else { data = { discordAppID: ID }; }

        fs.writeFileSync('app/config.json', JSON.stringify(data, null, 4));
    });
};

connect.onclick = rpcStart;