const
    audio = new Audio(),
    audioContext = new AudioContext(),
    audioAnalyser = new AnalyserNode(audioContext);

audioContext.createMediaElementSource(audio).connect(audioAnalyser);
audioAnalyser.connect(audioContext.destination);

let
    queueList = [],
    queueName = null,
    current = 0,
    interval = null;

function emitMetaData(fileLocation)
{
    const { getAlbumArt, read, buffer2DataURL } = require('./js/util');

    const tags = read.metadata()[fileLocation];

    if (tags === undefined)
    {
        const { parseFile } = require('music-metadata');

        parseFile(fileLocation).then((tag) =>
        {
            const { album, albumartist, title, picture } = tag.common;

            const send =
            {
                title,
                albumArtist: albumartist,
                album
            };

            document.dispatchEvent(new CustomEvent('-updateRPC', {detail: send}));

            send.picture =
            {
                format: picture[0]?.format,
                buffer: picture[0]?.data,
                URL: buffer2DataURL(picture[0]?.format, picture[0]?.data)
            };

            document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: send}));
        });
    }

    else
    {
        document.dispatchEvent(new CustomEvent('-updateRPC', {detail: tags}));

        getAlbumArt(fileLocation).then((pic) =>
        {
            tags.picture = pic;

            document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: tags}));
        });
    }
};

function play({detail} = '')
{
    if (detail !== undefined)
    {
        if (typeof(detail) === 'object')
        {
            queueList = [...detail.filePaths];

            queueName = detail.queueName;

            current = detail.current || 0;
        }

        else { current = detail; }
    }

    const { getAudioDuration } = require('./js/util');

    const fileLocation = queueList[current];

    audio.src = fileLocation;

    emitMetaData(fileLocation);

    getAudioDuration(fileLocation).then(time => document.dispatchEvent(new CustomEvent('-setTime', {detail: time})));

    document.dispatchEvent(new CustomEvent('-current', {detail: current}));

    document.dispatchEvent(new CustomEvent('-storeQueue', {detail: {queueList, queueName}}));
        
    pauseORplay();

    visualizer();
};

function pauseORplay(x)
{
    if (audio.paused)
    {
        if (audio.src.length === 0)
        {
            if (x)
            { return alert('Choose a song first !'); }
        }

        else { audio.play(); }
    }

    else { audio.pause(); }

    document.dispatchEvent(new CustomEvent('-/Audio/Analyser/Context', {detail: {audio, audioAnalyser, audioContext}}));
};

function changeCurrentState(E)
{
    const
        imgPause = document.getElementById('imgPause'),
        imgPlay = document.getElementById('imgPlay'),
        albumArtLyricsWrapper = document.getElementById('albumArtLyricsWrapper');

    if (E.type === 'pause')
    {
        if (audio.duration === audio.currentTime && queueList.length !== (current + 1))
        {
            current++;

            play();
        }

        albumArtLyricsWrapper.style.transform = 'scale(0.98)';

        imgPause.classList.add('opacity0');
        imgPlay.classList.remove('opacity0');
    }

    else
    {
        albumArtLyricsWrapper.style.transform = '';

        imgPlay.classList.add('opacity0');
        imgPause.classList.remove('opacity0');
    }
};

function skip(E)
{
    pauseORplay();

    const id = E.target.id;

    const int = setInterval(() =>
    {
        if (audio.paused)
        {
            clearInterval(int);

            if (queueList.length === 0) return;

            if (id === 'imgNext')
            {
                if (queueList.length === (current + 1)) return play();
            
                current++;
                
                play(); 
            }
            
            if (id === 'imgPrevious')
            {
                if (current === 0) return play();
            
                current = current - 1;
                
                play(); 
            }
        }   
    });
};

function audioPlay(E)
{
    changeCurrentState(E);

    interval = setInterval(() =>
    {
        const detail =
        {
            currentTime: audio.currentTime,
            duration: audio.duration
        };

        document.dispatchEvent(new CustomEvent('-updateTimeLine', {detail}));
    }, 1000);
};

function audioPause(E)
{
    changeCurrentState(E);

    clearInterval(interval);

    interval = null;
};

function pauseThenPlay(obj)
{
    pauseORplay();

    const int = setInterval(() =>
    {
        if (audio.paused)
        {
            clearInterval(int);

            play(obj);
        }
    });
};

function rearrange({detail: {from, to}})
{
    const
        FROM = parseInt(from),
        TO = parseInt(to);

    const temp = queueList[FROM];

    if (TO > FROM)
    {
        queueList.splice(TO + 1, 0, temp);
    
        queueList.splice(FROM, 1);
    }

    else
    {
        queueList.splice(TO, 0, temp);
    
        queueList.splice(FROM + 1, 1);
    }

    const childern = Array.from(document.querySelector('#queuesHolder .current').children);

    childern.splice(childern.length - 1, 1);

    let i = 0;

    childern.forEach((x) =>
    {
        x.dataset.id = i;

        x.style.borderColor === 'var(--accent)' ? current = i : null;
        
        i++;
    });

    document.dispatchEvent(new CustomEvent('-current', {detail: current}));

    document.dispatchEvent(new CustomEvent('-storeQueue', {detail: {queueList, queueName}}));
};

function visualizer()
{
    requestAnimationFrame(visualizer);

    const
        freqArray = new Uint8Array(audioAnalyser.frequencyBinCount),
        bars = freqArray.length;
    
    audioAnalyser.getByteFrequencyData(freqArray);

    const
        canvas = document.querySelector('canvas'),
        $ = canvas.getContext('2d');

    $.clearRect(0, 0, canvas.width, canvas.height);
    $.fillStyle = '#FFFFFF';
    
    for (let i = 0; i < bars; i++)
    {
        const
            x = i * 4,
            y = canvas.height,
            w = 2,
            h = -(freqArray[i] / 3);

        $.fillRect(x, y, w, h);
    }
};

document.getElementById('pauseORplay').onclick = pauseORplay;
document.getElementById('nextSong').onclick = skip;
document.getElementById('previousSong').onclick = skip;

audio.addEventListener('pause', audioPause);
audio.addEventListener('play', audioPlay);

document.addEventListener('-clickedQueueItem', pauseThenPlay);
document.addEventListener('-selectedFilePaths', pauseThenPlay);
document.addEventListener('-rearrange', rearrange);