function clickSetBorder(E)
{
    const li = util.getElement('li', E);

    if (li === undefined) return;

    const currentQueue = document.querySelector('#queuesHolder .current');

    const children = Array.from(currentQueue.children);

    if (children.length === 0) return;

    children.forEach(x => x.style.borderColor = '');

    li.style.borderColor = 'var(--accent)';

    document.dispatchEvent(new CustomEvent('-clickedQueueItem', {detail: children.indexOf(li)}));
};

function queueSetBorder({detail})
{
    const current = detail;

    const children = Array.from(document.querySelector('#queuesHolder .current').children);
    
    children.forEach(x => x.style.borderColor = '');

    children[current].style.borderColor = 'var(--accent)';
};

document.querySelector('section.queue #queuesHolder').addEventListener('click', clickSetBorder);
document.addEventListener('-setBorder', queueSetBorder);