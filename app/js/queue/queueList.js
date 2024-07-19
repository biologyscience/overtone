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
    const queueName = target.dataset.queueName;

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
        { title } = util.read.metadata()[fileLocation];

    document.dispatchEvent(new CustomEvent('-contextMenu', {detail: {ctx: 'queueSong', title, dataset: {fileLocation}}}));
};

function queueOptions(E)
{
    const queueOptions = document.getElementById('queueOptions');

    let target = E;

    if (E?.target !== undefined) target = E.target;

    if (target.localName === 'button')
    {
        const queueLI = target.parentElement;

        queueOptions.dataset.queueName = queueLI.querySelector('.queueName').innerText;

        const { top, height } = queueLI.getBoundingClientRect();

        queueOptions.style.setProperty('--top', `${top - (height / 2)}px`);

        queueOptions.classList.add('visible');
    }

    if (target.dataset.function === 'rename')
    {
        
    }

    if (target.dataset.function === 'remove')
    {
        const
            { queueName } = queueOptions.dataset,
            queues = new util.json('app/json/queues.json'),
            queuesData = queues.read();

        delete queuesData[queueName];
        queuesData.queueOrder.splice(queuesData.queueOrder.indexOf(queueName), 1);
        queues.save();

        const queueLI = document.querySelector(`#queueList [data-queue-name="${queueName}"]`).parentElement;

        if (queueLI.classList.contains('current'))
        {
            const
                queueItems = Array.from(document.getElementById('queueList').children),
                index = queueItems.indexOf(queueLI);

            let toChoose = index;

            index === (queueItems.length - 1) ? toChoose-- : toChoose++;

            if (queueItems.length === 1) return document.dispatchEvent(new Event('-resetDisplayRight'));
            
            chooseQueue(queueItems[toChoose].querySelector('span'));
            
            document.dispatchEvent(new CustomEvent('-setPlayingQueueBorder', {detail: queueItems[toChoose]}));

            setTimeout(() => { document.querySelector('#queuesHolder ul.current li .info').click(); });
        }
        
        queueLI.remove();

        queueOptions.classList.remove('visible');
    }
};

document.querySelector('section.queue .queueListWrapper').addEventListener('click', () => ['displayLeftOverlay', 'queueListMenu'].forEach(x => document.getElementById(x).classList.add('visible')));
document.querySelector('#queueListMenu .head .close').addEventListener('click', () => ['displayLeftOverlay', 'queueListMenu', 'queueOptions'].forEach(x => document.getElementById(x).classList.remove('visible')));
document.getElementById('queuesHolder').addEventListener('contextmenu', rightClickInQueuesHolder);

document.getElementById('queueList').addEventListener('click', ({target}) =>
{
    if (target.localName === 'span') chooseQueue(target);

    if (target.localName === 'button') queueOptions(target);
});
document.getElementById('queueOptions').addEventListener('click', queueOptions);

document.addEventListener('-selectedAlbum', updateNumber);
document.addEventListener('-selectedArtist', updateNumber);
document.addEventListener('-current', updateNumber);
document.addEventListener('-addItemToQueueList', addItemToQueueList);
document.addEventListener('-currentQueueReady', ({detail}) => document.getElementById('queueName').innerHTML = detail);