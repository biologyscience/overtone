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
            Object.assign(queueList, detail);

            current = 0;
        }

        else { current = detail; }
    }

    const { parseFile } = require('music-metadata');
    const { getAudioDuration } = require('./js/util');

    const fileLocation = queueList[current];

    audio.src = fileLocation;

    parseFile(fileLocation).then(tags => document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: tags})));

    document.dispatchEvent(new CustomEvent('-updateRPC', {detail: fileLocation}));

    getAudioDuration(fileLocation).then(time => document.dispatchEvent(new CustomEvent('-setTime', {detail: time})));

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

    const childern = Array.from(document.getElementById('currentQueueList').children);

    childern.splice(childern.length - 1, 1);

    let i = 0;

    childern.forEach((x) =>
    {
        x.dataset.id = i;

        x.style.borderColor === 'var(--accentGreen1)' ? current = i : null;
        
        i++;
    });

    document.dispatchEvent(new CustomEvent('-current', {detail: current}));
};


document.getElementById('pauseORplay').onclick = pauseORplay;
document.getElementById('imgNext').onclick = skip;
document.getElementById('imgPrevious').onclick = skip;

audio.addEventListener('pause', audioPause);
audio.addEventListener('play', audioPlay);

document.addEventListener('-clickedQueueItem', pauseThenPlay);
document.addEventListener('-selectedFilePaths', pauseThenPlay);
document.addEventListener('-rearrange', rearrange);