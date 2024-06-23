new sortable(document.getElementById('queueList'),
{
    draggable: '.dragger',
    animation: 300,
    chosenClass: 'greenBorder',
    ghostClass: 'displayNone'
});

let currentQueue;

function initiateDrag({detail})
{
    const ul = Array.from(document.getElementById('queuesHolder').children).filter(x => x.dataset.queueName === detail)[0];

    const options =
    {
        draggable: '.dragger',
        animation: 300,
        chosenClass: 'greenBorder',
        ghostClass: 'displayNone',
        onDrop: (x) =>
        {
            if (x.changed)
            {
                const from = x.from.node.dataset.id;

                const to = x.to.node.dataset.id;

                document.dispatchEvent(new CustomEvent('-rearrange', {detail: {from, to}}));
            }
        }
    };

    currentQueue?.destroy();

    currentQueue = new sortable(ul, options);
};

document.addEventListener('-currentQueueReady', initiateDrag);