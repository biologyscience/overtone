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

    if (tags === undefined)
    {
        musicMetadata.parseFile(fileLocation).then((tag) =>
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
                URL: util.buffer2DataURL(picture[0]?.format, picture[0]?.data)
            };

            document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: send}));
        });
    }

    else
    {
        document.dispatchEvent(new CustomEvent('-updateRPC', {detail: tags}));

        util.getAlbumArt(fileLocation).then((pic) =>
        {
            tags.picture = pic;

            document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: tags}));
        });
    }
};

function play(E)
{
    if (E.type === '-selectedAlbum')
    {
        const { album, albumArtist, position, queueNameInList } = E.detail;

        queueName = queueNameInList || album;
        current = position;
        queueList = util.read.queues()[queueNameInList] || util.read.albums()[util.formatter(album, albumArtist)].songs.sort(util.sort.byTrackNumber);
    }

    else if (E.type === '-clickedQueueItem') { current = E.detail; }

    else if (E.type === '-playArtist')
    {
        const { QueueName, QueueList } = E.detail;

        queueName = QueueName;
        current = 0;
        queueList = QueueList;
    }

    const fileLocation = queueList[current];

    audio.src = fileLocation;

    emitMetaData(fileLocation);

    util.getAudioDuration(fileLocation).then(time => document.dispatchEvent(new CustomEvent('-setTime', {detail: time})));

    document.dispatchEvent(new CustomEvent('-current', {detail: current}));

    document.dispatchEvent(new CustomEvent('-storeQueue', {detail: {queueList, queueName}}));

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

    document.dispatchEvent(new CustomEvent('-audioAnalyser', {detail: audioAnalyser}));
};

function changeCurrentState(E)
{
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
    audio.currentTime = currentTime === undefined ? 0 : currentTime;
    queueList = QueueList === undefined ? [] : QueueList;
    queueName = QueueName;
    current = 0 || Current;
};

document.getElementById('pauseORplay').onclick = pauseORplay;
document.getElementById('nextSong').onclick = skip;
document.getElementById('previousSong').onclick = skip;

audio.addEventListener('pause', audioPause);
audio.addEventListener('play', audioPlay);

document.addEventListener('-clickedQueueItem', pauseThenPlay);
document.addEventListener('-selectedAlbum', pauseThenPlay);
document.addEventListener('-playArtist', pauseThenPlay);
document.addEventListener('-rearrange', rearrange);
document.addEventListener('-timeChange', timeChange);
document.addEventListener('-volumeChange', ({detail}) => audio.volume = detail);
document.addEventListener('-closeApp', closeApp);
document.addEventListener('-setVariables', setVariables);