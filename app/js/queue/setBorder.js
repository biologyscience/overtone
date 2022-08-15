function clickSetBorder(E)
{
    const { getElement, json } = require('./js/util');

    const li = getElement('li', E);

    if (li === undefined) return;

    const currentQueue = document.querySelector('.queue.current');

    const children = Array.from(currentQueue.children);

    if (children.length === 0) return;

    children.forEach(x => x.style.borderColor = '');

    li.style.borderColor = 'var(--accentGreen1)';

    const queueName = currentQueue.dataset.queueName;

    const filePaths = new json('app/queues.json').read()[queueName];

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

    children[current].style.borderColor = 'var(--accentGreen1)';
};

document.querySelector('#div-queue #content').addEventListener('click', clickSetBorder);
document.addEventListener('-setBorder', queueSetBorder);