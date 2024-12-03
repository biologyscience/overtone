let queueReady = false;

function showQueue(queueName)
{
    const queuesHolder = document.getElementById('queuesHolder');

    Array.from(queuesHolder.children).forEach((x) =>
    {
        if (x.classList.contains('current')) x.classList.remove('current');
        
        if (x.dataset.queueNameHash === util.formatter(queueName)) x.classList.add('current');
    });

    queueReady = true;

    document.dispatchEvent(new CustomEvent('-changeNavbarItemFocus', {detail: 'queue'}));

    document.dispatchEvent(new CustomEvent('-currentQueueReady', {detail: queueName}));
};

function setQueue(E)
{
    queueReady = false;

    let
        id = 0,
        queueName = E.detail;
        paths = util.read.queues()[queueName];
    
    const queuesHolder = document.getElementById('queuesHolder');

    if (E.type === '-selectedAlbum')
    {
        paths = util.read.albums()[util.formatter(E.detail.album, E.detail.albumArtist)].songs.sort(util.sort.byTrackNumber);

        queueName = E.detail.album;
    }

    if (E.type === '-selectedArtist')
    {
        paths = [];

        const artistName = E.detail;

        util.read.artists()[artistName]
        .sort((a, b) => b.year - a.year)
        .forEach((x) =>
        {
            util.read.albums()[util.formatter(x.album, artistName)].songs
            .sort(util.sort.byTrackNumber)
            .forEach(y => paths.push(y));
        });
    }

    if (E.type === '-singleSong')
    {
        paths = [E.detail.path];
        queueName = E.detail.title;
    }

    if (queuesHolder.querySelectorAll(`[data-queue-name-hash="${util.formatter(queueName)}"]`).length === 0)
    {
        const ul = document.createElement('ul');

        ul.dataset.queueNameHash = util.formatter(queueName);
    
        paths.forEach((x) =>
        {
            const tags = util.read.metadata()[x];
    
            const data =
            `
            <div class="dragger flexCenter cursorGrab">
                <img src="svg/drag.svg" draggable="false">
            </div>
            <div class="info flexCol relative cursorPointer" data-song-duration=${tags.duration}>
                <span class="overflowPrevent">${tags.title}</span>
                <span class="overflowPrevent">${tags.albumArtist}</span>
                <span class="overflowPrevent">${tags.album}</span>
            </div>
            <button class="options flexCenter cursorPointer">
                <img src="svg/moreHorizontal.svg" draggable="false">
            </button>
            `;
    
            const li = document.createElement('li');
    
            li.classList.add('grid');
    
            li.innerHTML = data;
    
            li.dataset.id = id;
    
            id++;
    
            ul.append(li);
        });
    
        queuesHolder.append(ul);
    }

    showQueue(queueName);

    if (E.type === '-selectedArtist') document.dispatchEvent(new CustomEvent('-playArtist', {detail: {QueueName: queueName, QueueList: paths}}));
};

['-selectedAlbum', '-selectedArtist', '-chooseQueue', '-singleSong'].forEach(x => document.addEventListener(x, setQueue));

document.addEventListener('-current', (obj) =>
{
    const int = setInterval(() => 
    {
        if (queueReady)
        {
            clearInterval(int);

            document.dispatchEvent(new CustomEvent('-setBorder', obj));
        }
    });
});