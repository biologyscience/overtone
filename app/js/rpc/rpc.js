const discordClient = new rpc.Client({transport: 'ipc'});

let rpcConnected = false;

function rpcStart()
{
    const
        connect = document.getElementById('connect'),
        ID = util.read.config().discordAppID,
        pressence = 
        {
            state: 'Name of the Song',
            details: 'Name of the Artist'
        };

    discordClient.once('ready', () =>
    {
        discordClient.setActivity(pressence);

    });

    discordClient.login({clientId: ID}).then((detail) =>
    {
        connect.innerHTML = 'Connected';
        connect.style.borderColor = 'var(--accentGreen1)';

        rpcConnected = true;
    });
};

function updateRPC({detail})
{
    console.log(rpcConnected);

    if (!rpcConnected) return;

    const tags = detail;

    const pressence = 
    {
        details: tags.title,
        state: tags.albumArtist,
        largeImageKey: util.formatter(tags.album, tags.albumArtist),
        largeImageText: tags.album
    };

    discordClient.setActivity(pressence);
};

document.getElementById('connect').addEventListener('click', rpcStart);
document.addEventListener('-updateMetaData', updateRPC);