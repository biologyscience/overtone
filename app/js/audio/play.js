const
    audio = new Audio(),
    audioContext = new AudioContext(),
    audioAnalyser = new AnalyserNode(audioContext);

audioContext.createMediaElementSource(audio).connect(audioAnalyser);
audioAnalyser.connect(audioContext.destination);

let
    queueList = [],
    queueName = undefined,
    current = 0,
    interval = null;

function emitMetaData(fileLocation)
{
    const tags = util.read.metadata()[fileLocation];

    document.dispatchEvent(new CustomEvent('-updateRPC', {detail: tags}));

    util.getAlbumArt(fileLocation).then((pic) =>
    {
        tags.picture = pic;

        document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: tags}));
    });
};

function play(E)
{
    if (E?.type === '-selectedAlbum')
    {
        const { album, albumArtist, position } = E.detail;

        queueName = album;
        current = position;
        queueList = util.read.albums()[util.formatter(album, albumArtist)].songs.sort(util.sort.byTrackNumber);
    }

    else if (E?.type === '-clickedQueueItem')
    {
        queueName = E.detail.queueNameInList;
        current = E.detail.position;
        queueList = util.read.queues()[queueName];
    }

    else if (E?.type === '-playArtist')
    {
        const { QueueName, QueueList } = E.detail;

        queueName = QueueName;
        current = 0;
        queueList = QueueList;
    }

    const fileLocation = queueList[current];

    emitMetaData(fileLocation);

    audio.src = fileLocation;

    const tags = util.read.metadata()[fileLocation];

    const detail = { duration: tags.duration, rawDuration: tags.rawDuration };

    document.dispatchEvent(new CustomEvent('-setTime', {detail}));

    document.dispatchEvent(new CustomEvent('-current', {detail: current}));

    document.dispatchEvent(new CustomEvent('-storeQueue', {detail: {queueList, queueName}}));

    pauseORplay();
};

function pauseORplay()
{
    if (audio.src.length === 0) return;

    if (audio.paused) audio.play();
    else audio.pause();

    document.dispatchEvent(new CustomEvent('-audioAnalyser', {detail: audioAnalyser}));
};

function changeCurrentState(E)
{
    emitMetaData(queueList[current]);

    const
        imgPause = document.getElementById('imgPause'),
        imgPlay = document.getElementById('imgPlay'),
        head = document.querySelector('#displayRight .head');

    if (E.type === 'pause')
    {
        if (audio.duration === audio.currentTime && queueList.length !== (current + 1))
        {
            current++;

            play();
        }

        head.style.transform = 'scale(0.98)';

        imgPause.classList.add('opacity0');
        imgPlay.classList.remove('opacity0');
    }

    else
    {
        head.style.transform = '';

        imgPlay.classList.add('opacity0');
        imgPause.classList.remove('opacity0');
    }
};

function skip({target})
{
    pauseORplay();

    const id = target.id;

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
            
                current--;
                
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

        x.classList.contains('current') ? current = i : null;
        
        i++;
    });

    document.dispatchEvent(new CustomEvent('-current', {detail: current}));

    document.dispatchEvent(new CustomEvent('-storeQueue', {detail: {queueList, queueName}}));
};

function timeChange({detail})
{
    const percent = detail.toFixed(4);

    audio.currentTime = percent * audio.duration;
};

function closeApp()
{
    const
        config = new util.json('app/json/config.json'),
        configData = config.read();

    configData.font = getComputedStyle(document.querySelector(':root')).getPropertyValue('--currentFont');
    configData.volume = audio.volume;
    configData.lastQueueState =
    {
        queueName,
        position: current,
        time:
        {
            current: util.parseTime(audio.currentTime * 1000),
            total: util.parseTime(audio.duration * 1000)
        }
    };
    
    if (queueName === undefined) delete configData.lastQueueState;
    
    config.save();

    electron.ipcRenderer.send('ipc-close');
};

function setVariables({detail})
{
    const { volume, src, currentTime, QueueList, QueueName, Current } = detail;

    audio.volume = volume;
    if (src !== undefined) audio.src = src;
    if (currentTime !== undefined) audio.currentTime = currentTime;
    if (QueueList !== undefined) queueList = QueueList;
    queueName = QueueName;
    current = 0 || Current;
};

document.getElementById('pauseORplay').onclick = pauseORplay;
['nextSong', 'previousSong'].forEach(x => document.getElementById(x).onclick = skip);

audio.addEventListener('pause', audioPause);
audio.addEventListener('play', audioPlay);

['-clickedQueueItem', '-selectedAlbum', '-playArtist'].forEach(x => document.addEventListener(x, pauseThenPlay));
document.addEventListener('-rearrange', rearrange);
document.addEventListener('-timeChange', timeChange);
document.addEventListener('-volumeChange', ({detail}) => audio.volume = detail);
document.addEventListener('-closeApp', closeApp);
document.addEventListener('-setVariables', setVariables);