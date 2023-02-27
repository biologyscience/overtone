function updateNumber({detail})
{
    const thing = detail;
    
    if (typeof(thing) === 'object')
    {
        const totalSongsInCurrentQueue = document.getElementById('totalSongsInCurrentQueue');

        totalSongsInCurrentQueue.innerHTML = thing.length;
    }

    else
    {
        const currentSongIndex = document.getElementById('currentSongIndex');

        currentSongIndex.innerHTML = thing + 1;
    }
};

function chooseQueue({currentTarget})
{
    const span = currentTarget;

    if (span.localName !== 'span') return;
    
    const queueName = span.dataset.queueName;

    const { read } = require('./js/util');

    const queueData = read.queues().filter(x => x.queueName === queueName)[0];

    document.dispatchEvent(new CustomEvent('-chooseQueue', {detail: queueData}));

    document.getElementById('queueListMenu').classList.toggle('visible')

    updateNumber({detail: queueData.filePaths});
};

function addItemToQueueList({detail: {queueName, position}})
{
    const data =
    `
    <div class="dragger flexCenter cursorGrab">
        <img src="svg/drag.svg" draggable="false">
    </div>
    <!-- <span class="position">${position}</span> -->
    <span class="queueName overflowPrevent cursorPointer" data-queue-name="${queueName}">${queueName}</span>
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
    document.getElementById('queueNumber').innerHTML = ul.dataset.position;
};

document.querySelector('section.queue .queueListWrapper').addEventListener('click', () => document.getElementById('queueListMenu').classList.toggle('visible'));
document.querySelector('#queueListMenu .head .close').addEventListener('click', () => document.getElementById('queueListMenu').classList.toggle('visible'));
document.getElementById('queueList').addEventListener('click', chooseQueue);

document.addEventListener('-selectedFilePaths', updateNumber);
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