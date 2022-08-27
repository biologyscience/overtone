const audio = new Audio();

let
    queueList = [],
    queueName = null,
    current = 0,
    interval = null;

function play({detail} = '')
{
    if (detail !== undefined)
    {
        if (typeof(detail) === 'object')
        {
            queueList = [...detail.filePaths];

            queueName = detail.queueName;

            detail.current === undefined ? current = 0 : current = detail.current;
        }

        else { current = detail; }
    }

    const { getAudioDuration, read } = require('./js/util');

    const fileLocation = queueList[current];

    audio.src = fileLocation;

    if (read.metadata[fileLocation] === undefined)
    {
        const { parseFile } = require('music-metadata');

        parseFile(fileLocation).then(tags => document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: tags})));
    }

    else { document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: read.metadata[fileLocation]})); }

    document.dispatchEvent(new CustomEvent('-updateRPC', {detail: fileLocation}));

    getAudioDuration(fileLocation).then(time => document.dispatchEvent(new CustomEvent('-setTime', {detail: time})));

    document.dispatchEvent(new CustomEvent('-current', {detail: current}));
        
    pauseORplay();

    //

    let temp = false;

    const queues = read.queues();

    for (x in queues)
    {
        if (queues[x].join('') === queueList.join(''))
        { return temp = false; }

        else { temp = true; }
    }

    if (temp)
    {
        document.dispatchEvent(new CustomEvent('-storeQueue', {detail: {queueList, queueName}}));
        document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail: queueName}));
    }
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

    const childern = Array.from(document.querySelector('.queue.current').children);

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


document.getElementById('pauseORplay').onclick = pauseORplay;
document.getElementById('nextSong').onclick = skip;
document.getElementById('previousSong').onclick = skip;

audio.addEventListener('pause', audioPause);
audio.addEventListener('play', audioPlay);

document.addEventListener('-clickedQueueItem', pauseThenPlay);
document.addEventListener('-selectedFilePaths', pauseThenPlay);
document.addEventListener('-rearrange', rearrange);