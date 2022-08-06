const audio = new Audio();

let
    queueList = [],
    current = 0,
    interval = null;

function play({detail} = '')
{
    if (detail !== undefined)
    {
        if (typeof(detail) === 'object')
        {
            queueList = detail;
            current = 0;
        }

        else { current = detail; }
    }

    const { parseFile } = require('music-metadata');
    const { getAudioDuration } = require('./js/util');

    audio.src = queueList[current];

    parseFile(queueList[current]).then(tags => document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: tags})));

    getAudioDuration(audio.src).then(time => document.dispatchEvent(new CustomEvent('-setTime', {detail: time})));

    document.dispatchEvent(new CustomEvent('-current', {detail: current}));
        
    pauseORplay();
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
};

function changeCurrentState(E)
{
    const
        imgPause = document.getElementById('imgPause'),
        imgPlay = document.getElementById('imgPlay'),
        albumArtWrapper = document.getElementById('albumArtWrapper');

    if (E.type === 'pause')
    {
        if (audio.duration === audio.currentTime && queueList.length !== (current + 1))
        {
            current++;

            play();
        }

        albumArtWrapper.style.transform = 'scale(0.98)';

        imgPause.classList.add('opacity0');
        imgPlay.classList.remove('opacity0');
    }

    else
    {
        albumArtWrapper.style.transform = '';

        imgPlay.classList.add('opacity0');
        imgPause.classList.remove('opacity0');
    }
};

function skip(E)
{
    pauseORplay();

    const id = E.target.id;

    setTimeout(() =>
    {
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
    });
};

function audioPause(E)
{
    changeCurrentState(E);

    clearInterval(interval);

    interval = null;
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

document.getElementById('pauseORplay').onclick = pauseORplay;
document.getElementById('imgNext').onclick = skip;
document.getElementById('imgPrevious').onclick = skip;

audio.addEventListener('pause', audioPause);
audio.addEventListener('play', audioPlay);

document.addEventListener('-clickedQueueItem', (obj) =>
{
    pauseORplay();

    setTimeout(() => play(obj));
});

document.addEventListener('-selectedFilePaths', (obj) =>
{
    pauseORplay();

    setTimeout(() => play(obj));
});