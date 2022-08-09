const sortable = require('sortable-dnd');

new sortable(document.getElementById('queueList'), {animation: 300});

function showQueues()
{
    const displayLeft = document.getElementById('displayLeft');
    const queueList = document.querySelector('.queueList');

    displayLeft.style.transition = 'opacity ease 300ms';
    displayLeft.style.opacity = '0.1';

    queueList.classList.remove('displayNone');
};

function hideQueues()
{
    const displayLeft = document.getElementById('displayLeft');
    const queueList = document.querySelector('.queueList');

    displayLeft.style.transition = 'opacity ease 300ms';

    setTimeout(() => displayLeft.style.transition = '', 300);

    displayLeft.style.opacity = '1';

    queueList.classList.add('displayNone');
};

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

document.getElementById('queueLists').onclick = showQueues;
document.querySelector('.titleHolder .close').onclick = hideQueues;

document.addEventListener('-selectedFilePaths', updateNumber);
document.addEventListener('-current', updateNumber)

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