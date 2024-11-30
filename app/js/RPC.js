const discordRPC =
{
    client: new rpc.Client({transport: 'ipc'}),
    connected: false,
    connectionCount: 0
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
    }).catch(() =>
    {
        discordRPC.connectionCount++;

        console.warn(`Attempt ${discordRPC.connectionCount}: Cannot connect to discord. Either discord is not opened or internet connection is unavailable.\nRetrying in 30 seconds.`);

        if (discordRPC.connectionCount < 6) return setTimeout(rpcStart, 30 * 1000);

        console.warn('Autoconnect to Discord RPC disabled, connect manually.');
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

    const
        itunesCache = new util.json('app/json/itunesCache.json'),
        images = itunesCache.read();
    
    const md5 = util.formatter(album, albumArtist);

    if (images[md5] === undefined)
    {
        fetch(`https://itunes.apple.com/search?media=music&limit=5&term=${album} ${albumArtist}`).then(x => x.json()).then((x) =>
        {
            if (x.resultCount === 0) return;

            const URL100 = x.results[0].artworkUrl100;
        
            const URL256 = URL100.split('100x100').join('256x256');
        
            pressence.largeImageKey = URL256;
        
            discordRPC.client.setActivity(pressence);

            images[md5] = URL256;

            itunesCache.save();
        }).catch(console.log);
    }

    else
    {
        pressence.largeImageKey = images[md5];

        discordRPC.client.setActivity(pressence);
    }
};

document.getElementById('connect').addEventListener('click', rpcStart);
document.addEventListener('-updateMetaData', updateRPC);