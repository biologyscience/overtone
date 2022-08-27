function rpcStart()
{
    const
        connect = document.getElementById('connect'),
        ID = document.getElementById('discordAppID').value,
        pressence = 
        {
            state: 'Name of the Song',
            details: 'Name of the Artist'
        };

    if (ID === 0) return alert('Please enter your Discord Application ID');

    const
        { Client } = require('discord-rpc'),
        { json } = require('./js/util');

    const client = new Client({transport: 'ipc'});

    client.once('ready', () => client.setActivity(pressence));

    client.login({clientId: ID}).then((detail) =>
    {
        document.dispatchEvent(new CustomEvent('-RPC', {detail}));

        connect.innerHTML = 'Connected';
        connect.style.borderColor = 'var(--accentGreen1)';

        try
        {
            const
                file = new json('./app/json/config.json'),
                data = file.read();

            data.discordAppID = ID;

            file.save();

        } catch (e) { alert('Caannot write app id to config file !\nRestarting the app should fix it.'); }
    });
};

document.getElementById('connect').addEventListener('click', rpcStart);