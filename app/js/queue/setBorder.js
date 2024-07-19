function clickSetBorder(E)
{
    if (!(E.target.dataset.songDuration !== undefined || E.target.tagName === 'BUTTON')) return;

    const li = util.getElement('li', E);

    const currentQueue = document.querySelector('#queuesHolder ul.current');
    
    const children = Array.from(currentQueue.children);

    const
        fileLocation = util.read.queues()[currentQueue.dataset.queueName][parseInt(li.dataset.id)],
        { title } = util.read.metadata()[fileLocation];

    if (E.target.tagName === 'BUTTON') return document.dispatchEvent(new CustomEvent('-contextMenu', {detail: {ctx: 'queueSong', title, dataset: {fileLocation}}}));

    if (li === undefined || children.length === 0) return;

    children.forEach(x => x.classList.remove('current'));

    li.classList.add('current');

    const detail =
    {
        position: parseInt(li.dataset.id),
        queueNameInList: currentQueue.dataset.queueName
    };

    document.dispatchEvent(new CustomEvent('-clickedQueueItem', {detail}));
};

function queueSetBorder({detail})
{
    const current = detail;

    const int = setInterval(() =>
    {
        const currentQueue = document.querySelector('#queuesHolder ul.current');
        const children = Array.from(currentQueue.children);

        if (children.length > 0)
        {
            clearInterval(int);
    
            children.forEach(x => x.classList.remove('current'));
        
            children[current].classList.add('current');
        }
    });
};

function setPlayingQueueBorder({detail})
{
    const queueName = detail;

    Array.from(document.getElementById('queueList').children).forEach(x => x.classList.remove('current'));

    setTimeout(() =>
    {
        if (typeof(detail) !== 'string') return queueName.classList.add('current');
        
        document.querySelector(`#queueList li span[data-queue-name="${queueName}"]`).parentElement.classList.add('current');
    });
}

document.querySelector('section.queue #queuesHolder').addEventListener('click', clickSetBorder);
document.addEventListener('-setBorder', queueSetBorder);
document.addEventListener('-setPlayingQueueBorder', setPlayingQueueBorder);