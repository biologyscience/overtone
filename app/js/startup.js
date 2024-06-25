/**
 * title bar font size
 */
let d = setTimeout(() =>
{
    const titleBar = document.getElementById('titleBar');
    const name = document.querySelector('#titleBar .name');

    let resizeValue = getComputedStyle(titleBar).getPropertyValue('--fs').split('px')[0];

    function resize()
    {
        if (name.offsetHeight < titleBar.offsetHeight) return;

        resizeValue = resizeValue - 0.01;

        titleBar.style.setProperty('--fs', `${resizeValue}px`);

        resize();
    };

    resize();
}, 100);

//



let timeout = setTimeout(() =>
{
    [d, timeout].forEach((x) =>
    {
        clearTimeout(x);

        x = null;
    });
}, 2 * 1000);












{
    const { existsSync, readFileSync } = require('fs');
    const { read } = require('./js/util');
    const { watch } = require('chokidar');

    /* watch files */
    const watcher = watch(['app/css', 'app/js', 'app/index.html']);

    watcher.on('ready', () =>
    {
        watcher.on('all', () => window.location.reload());
    });

    /* queue list */
    const queueList = read.queues();

    for (const x in queueList)
    {
        document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail: x}));
    }
    
    /* fill previous id */
    if (existsSync('./app/json/config.json'))
    {
        const config = JSON.parse(readFileSync('./app/json/config.json'));
        
        if (config.discordAppID !== undefined)
        {
            const discordAppID = document.getElementById('discordAppID');
            discordAppID.value = config.discordAppID;

            const font = config.font;
            document.dispatchEvent(new CustomEvent('-setFont', {detail: font}));
        }
    }
        
    /* fill the folders */
    const checkMusicIn = read.config().checkMusicIn;
    
    if (checkMusicIn !== undefined)
    {
        const folders = document.getElementById('folders');
        
        const paths = Array.from(folders.children).map(x => x.dataset.path);
        
        checkMusicIn.forEach((x) =>
        {
            if (paths.includes(x) === false)
            {
                const li = document.createElement('li');
                
                const name = x.split('\\');
                
                li.classList.add('folderItem', 'grid');
                
                li.dataset.path = x;
                
                li.innerHTML =
                `
                <img class="folder" src="svg/folder.svg">
                <div class="flexCol">
                    <span class="name">${name[name.length - 1]}</span>
                    <span class="path">${name.join('/')}</span>
                </div>
                <img src="svg/close.svg" class="deleteFolder pointerEventsNone">
                `;
                
                folders.append(li);
            }
        });
    }
}

// preload previous session
{
    const
        config = util.read.config(),
        detail = { volume: config.volume };
        
    document.querySelector(':root').style.setProperty('--currentFont', config.font);
    
    if (config.lastQueueState !== undefined)
    {
        const
            currentTime = config.lastQueueState.time.current,
            totalTime = config.lastQueueState.time.total,
            queueName = config.lastQueueState.queueName,
            position = config.lastQueueState.position,
            queueList = util.read.queues()[queueName],
            songLocation = queueList[position],
            theLine = document.getElementById('theLine');

        document.getElementById('currentTime').innerHTML = `${currentTime.minutes}:${currentTime.seconds}`;
        document.getElementById('totalTime').innerHTML = `${totalTime.minutes}:${totalTime.seconds}`;
    
        theLine.style.setProperty('--progress', `${(currentTime.ms / totalTime.ms) * 100}%`);
    
        theLine.querySelector('.popUp').innerHTML = `${currentTime.minutes}:${currentTime.seconds}`;
    
    
        volumeSlider.style.setProperty('--progress', `${config.volume * 100}%`);
        volumeFloat.dataset.percent = config.volume * 100;
    
        document.dispatchEvent(new CustomEvent('-chooseQueue', {detail: queueName}));
        document.dispatchEvent(new CustomEvent('-setBorder', {detail: position}));
    
        document.getElementById('currentSongIndex').innerHTML = position + 1;
        document.getElementById('totalSongsInCurrentQueue').innerHTML = queueList.length;
    
        util.getMetaData(songLocation).then(({title, albumArtist, album}) =>
        {
            document.getElementById('songName').innerHTML = title;
            document.getElementById('artistName').innerHTML = albumArtist;
            document.getElementById('albumName').innerHTML = album;
    
            document.getElementById('overlay').style.display = 'none';
            document.dispatchEvent(new Event('-AppLoaded'));
        });
    
        util.getAlbumArt(songLocation).then(({URL}) => document.getElementById('albumArt').setAttribute('src', URL));
    
        detail.src = songLocation;
        detail.currentTime = currentTime.ms / 1000;
        detail.QueueList = queueList;
        detail.QueueName = queueName;
        detail.Current = position;
    }

    document.dispatchEvent(new CustomEvent('-setVariables', {detail}));
}