const discordRPC =
{
    client: new rpc.Client({transport: 'ipc'}),
    connected: false,
    connectionCount: 0
};

// Buttons will not appear on your discord app. But other users can see the buttons.
// https://github.com/discordjs/RPC/issues/180#issuecomment-2313232518

const pressence =
{
    details: 'Name of the Song',
    state: 'Name of the Artist',
    largeImageText: 'Logo',
    largeImageKey: 'logo',
    buttons:
    [
        {
            label: 'OverTone',
            url: 'https://overtone.js.org'
        },

        {
            label: 'Powered by iTunes',
            url: 'https://performance-partners.apple.com/search-api'
        }
    ]
};

function rpcStart()
{
    const
        connect = document.getElementById('connect'),
        ID = util.read.config().discordAppID;

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

    pressence.details = title;
    pressence.state = albumArtist;
    pressence.largeImageText = album;

    const
        itunesCache = new util.json('app/json/itunesCache.json'),
        images = itunesCache.read();
    
    const md5 = util.formatter(album, albumArtist);

    if (images[md5] === undefined)
    {
        fetch(`https://itunes.apple.com/search?media=music&entity=album&limit=5&term=${album} ${albumArtist}`).then(x => x.json()).then((x) =>
        {
            if (x.resultCount === 0) return;

            const URL100 = x.results[0].artworkUrl100;
        
            const URL256 = URL100.split('100x100').join('256x256');
        
            pressence.largeImageKey = URL256;
        
            discordRPC.client.setActivity(pressence);

            images[md5] = URL256;

            itunesCache.save();
        }).catch(console.warn);
    }

    else
    {
        pressence.largeImageKey = images[md5];

        discordRPC.client.setActivity(pressence);
    }
};

document.getElementById('connect').addEventListener('click', rpcStart);
document.addEventListener('-updateMetaData', updateRPC);