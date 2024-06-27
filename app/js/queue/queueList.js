function updateNumber(data)
{
    const
        currentSongIndex = document.getElementById('currentSongIndex'),
        totalSongsInCurrentQueue = document.getElementById('totalSongsInCurrentQueue');

    if (data.type === '-current')
    {
        currentSongIndex.innerHTML = data.detail === -1 ? '-' : data.detail + 1;
        totalSongsInCurrentQueue.innerHTML = util.read.queues()[document.getElementById('queueName').innerText].length;
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

    Array.from(document.getElementById('queueList').children).forEach(x => x.classList.remove('current'));
    E.target.parentElement.classList.add('current');

    const int = setInterval(() => 
    {
        if (queueReady)
        {
            clearInterval(int);
    
            const queueListMenu = document.getElementById('queueListMenu');

            if (queueListMenu.classList.contains('visible'))
            {
                queueListMenu.classList.toggle('visible');

                updateNumber({detail: -1, type: '-current'});
            }
        }
    });
};

function addItemToQueueList({detail})
{
    if (detail === 'queuePositions') return;

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

document.querySelector('section.queue .queueListWrapper').addEventListener('click', () => document.getElementById('queueListMenu').classList.toggle('visible'));
document.querySelector('#queueListMenu .head .close').addEventListener('click', () => document.getElementById('queueListMenu').classList.toggle('visible'));
document.getElementById('queueList').addEventListener('click', chooseQueue);

document.addEventListener('-selectedAlbum', updateNumber);
document.addEventListener('-selectedArtist', updateNumber);
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