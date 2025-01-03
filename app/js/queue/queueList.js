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

function chooseQueue(target)
{    
    const queueName = target.innerText;

    document.dispatchEvent(new CustomEvent('-chooseQueue', {detail: queueName}));

    const int = setInterval(() => 
    {
        if (queueReady)
        {
            clearInterval(int);
    
            const queueListMenu = document.getElementById('queueListMenu');

            if (queueListMenu.classList.contains('visible'))
            {
                ['displayLeftOverlay', 'queueListMenu'].forEach(x => document.getElementById(x).classList.remove('visible'));

                updateNumber({detail: -1, type: '-current'});
            }
        }
    });
};

function addItemToQueueList({detail})
{
    const ql = document.getElementById('queueList');

    const md5 = util.formatter(detail);

    if (ql.querySelectorAll(`.queueName[data-queue-name-hash="${md5}"]`).length > 0) return;

    const data =
    `
    <div class="dragger flexCenter cursorGrab">
        <img src="svg/drag.svg" draggable="false">
    </div>
    <span class="queueName overflowPrevent cursorPointer" data-queue-name-hash="${md5}">${detail}</span>
    <input class="displayNone" value="${detail}"/>
    <button class="options flexCenter">
        <img src="svg/moreHorizontal.svg" draggable="false">
    </button>
    `;

    const li = document.createElement('li');

    li.classList.add('grid');

    li.innerHTML = data;

    ql.append(li);
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
        queueName = document.querySelector(`#queueList [data-queue-name-hash="${li.parentElement.dataset.queueNameHash}"`).innerText;
    }

    const
        fileLocation = util.read.queues()[queueName][position],
        { title } = util.read.metadata()[fileLocation];

    document.dispatchEvent(new CustomEvent('-contextMenu', {detail: {ctx: 'queueSong', title, dataset: {fileLocation}}}));
};

document.querySelector('section.queue .queueListWrapper').addEventListener('click', () => ['displayLeftOverlay', 'queueListMenu'].forEach(x => document.getElementById(x).classList.add('visible')));
document.getElementById('queuesHolder').addEventListener('contextmenu', rightClickInQueuesHolder);

document.querySelector('#queueListMenu .head .close').addEventListener('click', () =>
{
    ['displayLeftOverlay', 'queueListMenu'].forEach(x => document.getElementById(x).classList.remove('visible'));

    document.dispatchEvent(new Event('-closeQueueOptions'));
});

document.getElementById('queueList').addEventListener('click', ({target}) =>
{
    if (target.localName === 'span') chooseQueue(target);

    if (target.localName === 'button') document.dispatchEvent(new CustomEvent('-openQueueOptions', {detail: target}));
});

document.addEventListener('-selectedAlbum', updateNumber);
document.addEventListener('-selectedArtist', updateNumber);
document.addEventListener('-current', updateNumber);
document.addEventListener('-addItemToQueueList', addItemToQueueList);
document.addEventListener('-currentQueueReady', ({detail}) => document.getElementById('queueName').innerHTML = detail);