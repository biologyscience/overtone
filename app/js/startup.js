{
    const
        config = util.read.config(),
        detail = { volume: config.volume };

    /* watch files */
    const watcher = chokidar.watch(['app/css', 'app/js', 'app/index.html']);

    watcher.on('ready', () => watcher.on('all', () => window.location.reload()));

    /* queue list */
    for (const x in util.read.queues()) document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail: x}));
    
    /* fill previous id */
    config.discordAppID !== undefined ? document.getElementById('discordAppID').value = config.discordAppID : null;
        
    /* fill the folders */
    if (config.checkMusicIn !== undefined)
    {
        const folders = document.getElementById('folders');

        const foldersToRemove = [];
                
        config.checkMusicIn.forEach((x) =>
        {
            if (fs.existsSync(x) === false) return foldersToRemove.push(x);

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
        });

        if (foldersToRemove.length > 0) document.dispatchEvent(new CustomEvent('-removeFolder', {detail: foldersToRemove}));
    }

    // preload previous session
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
    
        theLine.style.setProperty('--progress', `${(currentTime.ms / totalTime.ms) * 100}%`);
    
        document.getElementById('currentTime').innerHTML = `${currentTime.minutes}:${currentTime.seconds >= 10 ? currentTime.seconds : `0${currentTime.seconds}`}`;
        document.getElementById('totalTime').innerHTML = `${totalTime.minutes}:${totalTime.seconds >= 10 ? totalTime.seconds : `0${totalTime.seconds}`}`;
        theLine.querySelector('.popUp').innerHTML = `${currentTime.minutes}:${currentTime.seconds >= 10 ? currentTime.seconds : `0${currentTime.seconds}`}`;
    
        volumeSlider.style.setProperty('--progress', `${config.volume * 100}%`);
        volumeFloat.dataset.percent = config.volume * 100;
    
        document.getElementById('queueList').querySelector(`li span[data-queue-name="${queueName}"]`).click();
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
            document.dispatchEvent(new CustomEvent('-setFont', {detail: config.font}));
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