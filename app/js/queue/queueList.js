function updateNumber(data)
{
    const
        currentSongIndex = document.getElementById('currentSongIndex'),
        totalSongsInCurrentQueue = document.getElementById('totalSongsInCurrentQueue');

    if (data.type === '-current')
    {
        currentSongIndex.innerHTML = data.detail === -1 ? '-' : data.detail + 1;
        setTimeout(() => { totalSongsInCurrentQueue.innerHTML = util.read.queues()[document.getElementById('queueName').innerText].length; });
    }

    else if (data.type === '-selectedAlbum')
    {
        const { album, albumArtist, position } = data.detail;
    
        currentSongIndex.innerHTML = position + 1;
        totalSongsInCurrentQueue.innerHTML = util.read.albums()[util.formatter(album, albumArtist)].songs.length;
    }

    else if (data.type === '-selectedArtist')
    {
        let counter = 0;

        const artistName = data.detail;

        util.read.artists()[artistName].forEach(x => counter += util.read.albums()[util.formatter(x.album, artistName)].songs.length);

        currentSongIndex.innerHTML = 1;
        totalSongsInCurrentQueue.innerHTML = counter;
    }
};

function chooseQueue(E)
{
    const span = E.target;

    if (span.localName !== 'span') return;
    
    const queueName = span.dataset.queueName;

    document.dispatchEvent(new CustomEvent('-chooseQueue', {detail: queueName}));

    const int = setInterval(() => 
    {
        if (queueReady)
        {
            clearInterval(int);
    
            const queueListMenu = document.getElementById('queueListMenu');

            if (queueListMenu.classList.contains('visible'))
            {
                closeOverlay();

                updateNumber({detail: -1, type: '-current'});
            }
        }
    });
};

function addItemToQueueList({detail})
{
    const ql = document.getElementById('queueList');

    if (ql.querySelectorAll(`.queueName[data-queue-name="${detail}"]`).length === 1) return;

    const data =
    `
    <div class="dragger flexCenter cursorGrab">
        <img src="svg/drag.svg" draggable="false">
    </div>
    <span class="queueName overflowPrevent cursorPointer" data-queue-name="${detail}">${detail}</span>
    <button class="options flexCenter">
        <img src="svg/moreHorizontal.svg" draggable="false">
    </button>
    `;

    const li = document.createElement('li');

    li.classList.add('grid');

    li.innerHTML = data;

    ql.append(li);
};

function closeOverlay()
{
    ['displayLeftOverlay', 'queueListMenu', 'leftContextMenu'].forEach(x => document.getElementById(x).classList.remove('visible'));
};

function rightClickInQueuesHolder(E)
{
    let
        position = E?.detail?.position
        queueName = E?.detail?.queueNameInList;

    if (position === undefined)
    {
        const { target } = E;

        if (target.parentElement.tagName !== 'LI') return;

        const li = target.parentElement;

        position = li.dataset.id;
        queueName = li.parentElement.dataset.queueName;
    }

    const
        fileLocation = util.read.queues()[queueName][position],
        songName = util.read.metadata()[fileLocation].title;
    
    const leftContextMenu = document.getElementById('leftContextMenu');

    leftContextMenu.dataset.fileLocation = fileLocation;
    leftContextMenu.querySelector('.head span').innerHTML = songName;

    ['leftContextMenu', 'displayLeftOverlay'].forEach(x => document.getElementById(x).classList.add('visible'));
};

['#displayLeftOverlay', '#queueListMenu .head .close', '#leftContextMenu .head .close'].forEach(x => document.querySelector(x).addEventListener('click', closeOverlay));

document.querySelector('section.queue .queueListWrapper').addEventListener('click', () => ['queueListMenu', 'displayLeftOverlay'].forEach(x => document.getElementById(x).classList.add('visible')));
document.getElementById('queueList').addEventListener('click', chooseQueue);
document.getElementById('displayLeftOverlay').addEventListener('click', closeOverlay);
document.getElementById('queuesHolder').addEventListener('contextmenu', rightClickInQueuesHolder);

document.addEventListener('-selectedAlbum', updateNumber);
document.addEventListener('-selectedArtist', updateNumber);
document.addEventListener('-current', updateNumber);
document.addEventListener('-addItemToQueueList', addItemToQueueList);
document.addEventListener('-currentQueueReady', ({detail}) => document.getElementById('queueName').innerHTML = detail);
document.addEventListener('-openContextMenuInQueue', rightClickInQueuesHolder);