function clickSetBorder(E)
{
    const { getElement, read } = require('./js/util');

    const li = getElement('li', E);

    if (li === undefined) return;

    const currentQueue = document.querySelector('.queue.current');

    const children = Array.from(currentQueue.children);

    if (children.length === 0) return;

    children.forEach(x => x.style.borderColor = '');

    li.style.borderColor = 'var(--accent)';

    const queueName = currentQueue.dataset.queueName;

    const filePaths = read.queues()[queueName];

    const detail =
    {
        filePaths,
        queueName,
        current: children.indexOf(li)
    };

    document.dispatchEvent(new CustomEvent('-clickedQueueItem', {detail}));
};

function queueSetBorder({detail})
{
    const current = detail;

    const children = Array.from(document.querySelector('.queue.current').children);
    
    children.forEach(x => x.style.borderColor = '');

    children[current].style.borderColor = 'var(--accent)';
};

document.querySelector('section.queue #content').addEventListener('click', clickSetBorder);
document.addEventListener('-setBorder', queueSetBorder);