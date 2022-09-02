function showQueues()
{
    const displayLeft = document.getElementById('displayLeft');

    displayLeft.style.transition = 'opacity ease 300ms';
    displayLeft.style.opacity = '0.1';

    document.getElementById('queueListMenu').classList.remove('displayNone');
};

function hideQueues()
{
    const displayLeft = document.getElementById('displayLeft');

    displayLeft.style.transition = 'opacity ease 300ms';

    displayLeft.style.opacity = '1';

    setTimeout(() => displayLeft.style.transition = '', 300);

    document.getElementById('queueListMenu').classList.add('displayNone');
};

function updateNumber({detail})
{
    const thing = detail;
    
    if (typeof(thing) === 'object')
    {
        const totalSongsInCurrentQueue = document.getElementById('totalSongsInCurrentQueue');

        totalSongsInCurrentQueue.innerHTML = thing.filePaths.length;
    }

    else
    {
        const currentSongIndex = document.getElementById('currentSongIndex');

        currentSongIndex.innerHTML = thing + 1;
    }
};

function chooseQueue(E)
{
    const span = E.target;

    if (span.localName === 'span')
    {
        const queueName = span.dataset.queueName;

        const { read } = require('./js/util');

        const filePaths = read.queues()[queueName];

        document.dispatchEvent(new CustomEvent('-chooseQueue', {detail: {filePaths, queueName}}));

        hideQueues();

        updateNumber({detail: {filePaths}});
    }
};

function addItemToQueueList({detail})
{
    const queueName = detail;

    const data =
    `
    <div class="dragger flexCenter cursorGrab">
        <img src="svg/drag.svg" draggable="false">
    </div>
    <span class="overflowPrevent cursorPointer" data-queue-name="${queueName}">${queueName}</span>
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

document.querySelector('section.queue .queueListWrapper').addEventListener('click', showQueues);
document.getElementById('queueList').addEventListener('click', chooseQueue);
document.querySelector('#queueListMenu .head .close').addEventListener('click', hideQueues);

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