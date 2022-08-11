function clickSetBorder(E)
{
    const li = require('./js/util').getElement('li', E);

    if (li === undefined) return;

    const children = Array.from(document.getElementById('currentQueueList').children);

    if (children.length === 0) return;

    children.forEach(x => x.style.borderColor = '');

    li.style.borderColor = 'var(--accentGreen1)';

    document.dispatchEvent(new CustomEvent('-clickedQueueItem', {detail: children.indexOf(li)}));
};

function queueSetBorder({detail})
{
    const current = detail;

    const children = Array.from(document.getElementById('currentQueueList').children);
    
    children.forEach(x => x.style.borderColor = '');

    children[current].style.borderColor = 'var(--accentGreen1)';
};

document.querySelector('#div-queue #content').addEventListener('click', clickSetBorder);
document.addEventListener('-setBorder', queueSetBorder);