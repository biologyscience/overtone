function clickSetBorder(E)
{
    const li = util.getElement('li', E);

    const currentQueue = document.querySelector('#queuesHolder .current');
    
    const children = Array.from(currentQueue.children);

    if (li === undefined || children.length === 0) return;

    children.forEach(x => x.classList.remove('current'));

    li.classList.add('current');

    document.dispatchEvent(new CustomEvent('-clickedQueueItem', {detail: {position: children.indexOf(li), queueNameInList: currentQueue.dataset.queueName}}));
};

function queueSetBorder({detail})
{
    const current = detail;

    const int = setInterval(() =>
    {
        if (Array.from(document.querySelector('#queuesHolder .current').children).length > 0)
        {
            clearInterval(int);
    
            const children = Array.from(document.querySelector('#queuesHolder .current').children);
    
            children.forEach(x => x.classList.remove('current'));
        
            children[current].classList.add('current');
        }
    });
};

document.querySelector('section.queue #queuesHolder').addEventListener('click', clickSetBorder);
document.addEventListener('-setBorder', queueSetBorder);