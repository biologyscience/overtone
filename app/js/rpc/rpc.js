const discordRPC =
{
    client: new rpc.Client({transport: 'ipc'}),
    connected: false
};

function rpcStart()
{
    const
        connect = document.getElementById('connect'),
        ID = util.read.config().discordAppID,
        pressence = 
        {
            details: 'Name of the Song',
            state: 'Name of the Artist',
            largeImageText: 'Logo',
            largeImageKey: 'logo'
        };

    discordRPC.client.login({clientId: ID}).then(() =>
    {
        connect.innerHTML = 'Connected';
        connect.style.borderColor = 'var(--accentGreen1)';

        discordRPC.connected = true;

        discordRPC.client.setActivity(pressence);
    });
};

function updateRPC({detail})
{
    if (!discordRPC.connected) return;

    const { title, albumArtist, album } = detail;

    const pressence = 
    {
        details: title,
        state: albumArtist,
        largeImageText: album
    };

    fetch(`https://itunes.apple.com/search?media=music&limit=5&term=${title} ${albumArtist}`).then(x => x.json()).then((x) =>
    {
        const URL100 = x.results?.[0]?.artworkUrl100;

        const URL256 = URL100.split('100x100').join('256x256');

        pressence.largeImageKey = URL256;

        discordRPC.client.setActivity(pressence);
    });
};

document.getElementById('connect').addEventListener('click', rpcStart);
document.addEventListener('-updateMetaData', updateRPC);