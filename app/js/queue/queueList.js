function updateNumber(data)
{
    const
        currentSongIndex = document.getElementById('currentSongIndex'),
        totalSongsInCurrentQueue = document.getElementById('totalSongsInCurrentQueue');


    if (typeof(data.detail) === 'number')
    {
        currentSongIndex.innerHTML = data.detail === -1 ? '-' : data.detail + 1;
        totalSongsInCurrentQueue.innerHTML = util.read.queues()[document.getElementById('queueName').innerHTML].length;
    }

    else
    {
        const { album, albumArtist, position } = data.detail;
    
        currentSongIndex.innerHTML = position + 1;
        totalSongsInCurrentQueue.innerHTML = util.read.albums()[util.formatter(album, albumArtist)].songs.length;
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
    
            document.getElementById('queueListMenu').classList.toggle('visible');

            updateNumber({detail: -1});
        }
    });
};

function addItemToQueueList({detail})
{
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
    const ql = document.getElementById('queueList');

    li.classList.add('grid');

    li.innerHTML = data;

    ql.append(li);
};

document.querySelector('section.queue .queueListWrapper').addEventListener('click', () => document.getElementById('queueListMenu').classList.toggle('visible'));
document.querySelector('#queueListMenu .head .close').addEventListener('click', () => document.getElementById('queueListMenu').classList.toggle('visible'));
document.getElementById('queueList').addEventListener('click', chooseQueue);

document.addEventListener('-selectedAlbum', updateNumber);
document.addEventListener('-current', updateNumber);
document.addEventListener('-addItemToQueueList', addItemToQueueList);
document.addEventListener('-currentQueueReady', ({detail}) => document.getElementById('queueName').innerHTML = detail);

/*

function clickSomeWhere(E)
{
    let clickedOnQueueLists = false;

    E.path.forEach(x => x.id === 'queueLists' ? clickedOnQueueLists = true : null);

    const queueList = document.querySelector('.queueList');

    console.log(clickedOnQueueLists, !queueList.classList.contains('displayNone'));

    if (clickedOnQueueLists || !queueList.classList.contains('displayNone')) return;

    const bounds = queueList.getBoundingClientRect();

    if (bounds.top < E.y && bounds.left < E.x && bounds.bottom > E.y && bounds.right > E.x)
    {
        console.log('in');
    }

    else
    {
        document.getElementById('displayLeft').style.transition = 'opacity ease 300ms';

        setTimeout(() => document.getElementById('displayLeft').style.transition = '', 300);

        document.getElementById('displayLeft').style.opacity = '1';
    
        document.querySelector('.queueList').classList.add('displayNone');

        console.log('out');
    }

    clickedOnQueueLists = null;
};

*/