const util = require('../util');

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

    audio.addEventListener('loadeddata', () =>
    {
        const
            totalTime = util.parseTime(audio.duration * 1000),
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
            const albumArt = util.buffer2DataURL(tags.common.picture[0].format, tags.common.picture[0].data);

            img.albumArt.setAttribute('src', albumArt);
        }

        const
            songName = tags.common?.title,
            albumArtist = tags.common?.albumartist,
            albumName = tags.common?.album;

        div.songName.innerHTML = songName;
        div.artistName.innerHTML = albumArtist;
        div.albumName.innerHTML = albumName;

        document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: tags}));
    });
};

function changeTimeline()
{
    audio.addEventListener('playing', () =>
    {
        const a = setInterval(() =>
        {
            const
                currentTime = audio.currentTime,
                totalTime = audio.duration,
                minutes = util.parseTime(currentTime * 1000).minutes.toString(),
                seconds = util.parseTime(currentTime * 1000).seconds.toString().length > 1 ? util.parseTime(currentTime * 1000).seconds : '0' + util.parseTime(currentTime * 1000).seconds,
                number = getComputedStyle(div.theLine).getPropertyValue('--maxWidth').split('%')[0];

            div.theLine.style.width = ((currentTime / totalTime) * parseInt(number)).toFixed(2) + '%';
    
            div.currentTime.innerHTML = minutes + ':' + seconds;
        }, 1000);

        intervals.push(a);
    });

    audio.addEventListener('pause', () => clearAllIntervals());
};

function clearAllIntervals()
{
    intervals.forEach(x => clearInterval(x));

    intervals = [];
};

button.choose.onclick = choose;
button.pauseORplay.onclick = pauseORplay;