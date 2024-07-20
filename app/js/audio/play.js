const
    audio = new Audio(),
    audioContext = new AudioContext(),
    audioAnalyser = new AnalyserNode(audioContext),
    timeSpent = {};

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

    else if (E?.type === '-singleSong')
    {
        const { title, path } = E.detail;

        queueName = title;
        current = 0;
        queueList = [path]
    }

    const fileLocation = queueList[current];

    emitMetaData(fileLocation);

    audio.src = fileLocation;

    if (timeSpent[fileLocation] === undefined) timeSpent[fileLocation] = 0;

    const { duration, rawDuration } = util.read.metadata()[fileLocation];

    document.dispatchEvent(new CustomEvent('-setPlayingQueueBorder', {detail: queueName}));

    document.dispatchEvent(new CustomEvent('-setTime', {detail: {duration, rawDuration}}));

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
        head.style.transform = 'scale(0.98)';

        imgPause.classList.add('opacity0');
        imgPlay.classList.remove('opacity0');
        
        if (audio.currentTime >= audio.duration)
        {
            if (current + 1 === queueList.length)
            {
                const
                    { queueOrder } = util.read.queues(),
                    currentQueueIndex = queueOrder.indexOf(queueName);
                    
                if (currentQueueIndex + 1 === queueOrder.length) return;

                queueName = queueOrder[currentQueueIndex + 1];

                document.querySelector(`#queueList li span[data-queue-name="${queueName}"]`).click();
                document.querySelector('#queuesHolder ul.current li[data-id="0"] .info').click();
            }

            else
            {
                current++;

                play();
            }
        }
    }

    else
    {
        head.style.transform = 'scale(1)';

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

        timeSpent[queueList[current]]++;
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
    if (audio.paused) return play(obj);
 
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

function rearrange(E)
{
    const
        oldIndex = E.detail.oldIndex,
        newIndex = E.detail.newIndex;

    if (oldIndex === newIndex) return;

    const
        queues = new util.json('app/json/queues.json'),
        queuesData = queues.read(),
        { queueOrder } = queuesData;

    if (E.type === '-rearrangeQueues')
    {
        const selected = queueOrder[oldIndex];

        queueOrder.splice(oldIndex, 1);

        const newOrder = [...queueOrder.slice(0, newIndex), selected, ...queueOrder.slice(newIndex)];

        queuesData.queueOrder = newOrder;
    }

    if (E.type === '-rearrangeSongs')
    {
        if ((oldIndex > current && newIndex > current) || (oldIndex < current && newIndex < current)) null;

        else current = newIndex;

        const
            qn = document.querySelector('#queuesHolder ul.current').dataset.queueName,
            ql = queuesData[qn];

        const selected = ql[oldIndex];

        ql.splice(oldIndex, 1);

        ql = [...ql.slice(0, newIndex), selected, ...ql.slice(newIndex)];

        if (qn === queueName)
        {
            queueList = ql;
            document.dispatchEvent(new CustomEvent('-current', {detail: current}));
        }
        
        queuesData[qn] = ql;
    }

    queues.save();
};

function timeChange({detail})
{
    const percent = detail.toFixed(4);

    audio.currentTime = percent * audio.duration;
};

function setVariables({detail})
{
    const { volume, src, currentTime, QueueList, QueueName, Current } = detail;

    audio.volume = volume || audio.volume;
    audio.src = src || audio.src;
    audio.currentTime = currentTime || audio.currentTime;
    queueList = QueueList || queueList;
    queueName = QueueName || queueName;
    current = Current || current || 0;

    if (queueList.length !== 0) timeSpent[queueList[current]] = 0;
};

function updatePlays()
{
    const
        metadata = new util.json('app/json/metadata.json'),
        data = metadata.read();
    
    for (const x in timeSpent)
    {
        const count = Math.floor(((timeSpent[x] / (data[x].rawDuration / 1000)) * 100) / 75);

        data[x].plays = data[x].plays + count;

        if (queueList[current] !== x) delete timeSpent[x];
    }
    
    metadata.save();
};

function closeApp()
{
    updatePlays();
    
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

document.getElementById('pauseORplay').onclick = pauseORplay;
['nextSong', 'previousSong'].forEach(x => document.getElementById(x).onclick = skip);

audio.addEventListener('pause', audioPause);
audio.addEventListener('play', audioPlay);

['-clickedQueueItem', '-selectedAlbum', '-playArtist', '-singleSong'].forEach(x => document.addEventListener(x, pauseThenPlay));
['-rearrangeQueues', '-rearrangeSongs'].forEach(x => document.addEventListener(x, rearrange));
document.addEventListener('-timeChange', timeChange);
document.addEventListener('-volumeChange', ({detail}) => audio.volume = detail);
document.addEventListener('-closeApp', closeApp);
document.addEventListener('-setVariables', setVariables);
document.addEventListener('-updatePlays', updatePlays);

document.getElementById('currentSongOptions').addEventListener('click', () => document.dispatchEvent(new CustomEvent('-contextMenu', {detail: {ctx: 'song', title: util.read.metadata()[queueList[current]].title}})));