function clickSetBorder(E)
{
    if (E.target.dataset.songDuration === undefined) return;

    const li = util.getElement('li', E);

    const currentQueue = document.querySelector('#queuesHolder ul.current');
    
    const children = Array.from(currentQueue.children);

    if (li === undefined || children.length === 0) return;

    children.forEach(x => x.classList.remove('current'));

    li.classList.add('current');

    document.dispatchEvent(new CustomEvent('-clickedQueueItem', {detail: {position: parseInt(li.dataset.id), queueNameInList: currentQueue.dataset.queueName}}));
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

    setTimeout(() => { document.querySelector(`#queueList li span[data-queue-name="${queueName}"]`).parentElement.classList.add('current'); });
}

document.querySelector('section.queue #queuesHolder').addEventListener('click', clickSetBorder);
document.addEventListener('-setBorder', queueSetBorder);
document.addEventListener('-setPlayingQueueBorder', setPlayingQueueBorder);