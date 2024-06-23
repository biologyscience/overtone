function updateNumber(data)
{
    if (typeof(data) === 'number') return document.getElementById('currentSongIndex').innerHTML = data === -1 ? '-' : data + 1;

    const { album, albumArtist, position } = data.detail;

    document.getElementById('totalSongsInCurrentQueue').innerHTML = util.read.albums()[util.formatter(album, albumArtist)].songs.length;
    document.getElementById('currentSongIndex').innerHTML = position + 1;
};

function chooseQueue(E)
{
    const span = E.target;

    if (span.localName !== 'span') return;
    
    const queueName = span.dataset.queueName;

    // const queueData = util.read.queues().filter(x => x.queueName === queueName)[0];

    document.dispatchEvent(new CustomEvent('-chooseQueue', {detail: queueName}));

    document.getElementById('queueListMenu').classList.toggle('visible')

    updateNumber(-1);
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

function displayQueueName({detail})
{
    const ul = detail;

    document.getElementById('queueName').innerHTML = ul.dataset.queueName;
};

document.querySelector('section.queue .queueListWrapper').addEventListener('click', () => document.getElementById('queueListMenu').classList.toggle('visible'));
document.querySelector('#queueListMenu .head .close').addEventListener('click', () => document.getElementById('queueListMenu').classList.toggle('visible'));
document.getElementById('queueList').addEventListener('click', chooseQueue);

document.addEventListener('-selectedAlbum', updateNumber);
document.addEventListener('-current', updateNumber);
document.addEventListener('-addItemToQueueList', addItemToQueueList);
document.addEventListener('-currentQueueReady', displayQueueName);

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