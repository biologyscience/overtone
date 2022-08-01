const parseTime = require('./parseTime');

const eventEmitter = require('events');
const event = new eventEmitter();

let intervals = [];

const audio = new Audio();

const div =
{
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    theLine: document.getElementById('theLine'),
    songName: document.getElementById('songName'),
    artistName: document.getElementById('artistName'),
    albumName: document.getElementById('albumName'),
    albumArtWrapper: document.getElementById('albumArtWrapper')
};

const button =
{
    choose: document.getElementById('choose'),
    pauseORplay: document.getElementById('pauseORplay')
};

const img =
{
    albumArt: document.getElementById('albumArt')
};

function choose()
{
    const remote = require('@electron/remote');

    const options = 
    {
        filters: [ { name: 'Music Files', extensions: ['mp3', 'flac'] } ],
        properties: ['showHiddenFiles']
    };

    remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), options)
    .then((selected) =>
    {
        if (selected.canceled) return;

        clearAllIntervals();
        pauseORplay();

        const fileLocation = selected.filePaths[0];

        audio.src = fileLocation;

        pauseORplay();
        setMetaTags(fileLocation);
    });
};

function pauseORplay(userClicked)
{
    if (audio.paused)
    {
        if (audio.src.length === 0)
        {
            if (userClicked)
            {
                return alert('Choose a song first !');
            } 
        }

        else
        {
            audio.play();

            div.albumArtWrapper.style.transform = '';

            document.getElementById('imgPause').classList.toggle('opacity0');
            document.getElementById('imgPlay').classList.toggle('opacity0');
        }
    }

    else
    {
        audio.pause();

        div.albumArtWrapper.style.transform = 'scale(0.98)';

        document.getElementById('imgPause').classList.toggle('opacity0');
        document.getElementById('imgPlay').classList.toggle('opacity0');
    }
};

function setMetaTags(fileLocation)
{
    const metadata = require('music-metadata');

    audio.addEventListener('loadeddata', (E) =>
    {
        const
            totalTime = parseTime(audio.duration * 1000),
            minutes = totalTime.minutes.toString(),
            seconds = totalTime.seconds.toString().length > 1 ? totalTime.seconds : '0' + totalTime.seconds;

        div.totalTime.innerHTML = minutes + ':' + seconds;

        changeTimeline();
    });

    metadata.parseFile(fileLocation).then((tags) =>
    {
        img.albumArt.setAttribute('src', './svg/empty.svg');

        if (tags.common?.picture)
        {
            const albumArt = 'data:' + tags.common.picture[0].format + ';base64,' + tags.common.picture[0].data.toString('base64');

            img.albumArt.setAttribute('src', albumArt);
        }

        const
            songName = tags.common?.title,
            albumArtist = tags.common?.albumartist,
            albumName = tags.common?.album;

        div.songName.innerHTML = songName;
        div.artistName.innerHTML = albumArtist;
        div.albumName.innerHTML = albumName;

        event.emit('update', fileLocation);
    });
};

function changeTimeline()
{
    audio.addEventListener('playing', (E) =>
    {
        const a = setInterval(() =>
        {
            const
                currentTime = audio.currentTime,
                totalTime = audio.duration,
                minutes = parseTime(currentTime * 1000).minutes.toString(),
                seconds = parseTime(currentTime * 1000).seconds.toString().length > 1 ? parseTime(currentTime * 1000).seconds : '0' + parseTime(currentTime * 1000).seconds,
                number = getComputedStyle(div.theLine).getPropertyValue('--maxWidth').split('%')[0];

            div.theLine.style.width = ((currentTime / totalTime) * parseInt(number)).toFixed(2) + '%';
    
            div.currentTime.innerHTML = minutes + ':' + seconds;
        }, 1000);

        const b = setInterval(() => { if (audio.paused) { clearAllIntervals(); } }, 1);

        intervals.push(a, b);
    });
};

function clearAllIntervals()
{
    intervals.forEach(x => clearInterval(x));

    intervals = [];
};

button.choose.onclick = choose;
button.pauseORplay.onclick = pauseORplay;

event.addListener('update', (fileLocation) =>
{
    require('./rpc/updateRPC')(fileLocation);
    require('./metaData/mediaSessionMetaData')(navigator, fileLocation);
});