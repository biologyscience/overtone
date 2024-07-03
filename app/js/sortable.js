new sortable(document.getElementById('queueList'),
{
    handle: '.dragger',
    draggable: 'li',
    chosenClass: 'greenBorder',
    ghostClass: 'displayNone',
    animation: 300,
    autoScroll: true,
    onDrop: (x) =>
    {
        const { oldIndex, newIndex } = x;

        if (oldIndex === newIndex) return;

        document.dispatchEvent(new CustomEvent('-rearrangeQueues', {detail: {oldIndex, newIndex}}));
    }
});

let currentQueue;

function initiateDrag({detail})
{
    const ul = Array.from(document.getElementById('queuesHolder').children).filter(x => x.dataset.queueName === detail)[0];

    const options =
    {
        handle: '.dragger',
        draggable: 'li',
        chosenClass: 'greenBorder',
        ghostClass: 'displayNone',
        animation: 300,
        autoScroll: true,
        onDrop: (x) =>
        {
            const { oldIndex, newIndex } = x;

            if (oldIndex === newIndex) return;
            
            document.dispatchEvent(new CustomEvent('-rearrangeSongs', {detail: {oldIndex, newIndex}}));
        }
    };

    currentQueue?.destroy();

    currentQueue = new sortable(ul, options);
};

document.addEventListener('-currentQueueReady', initiateDrag);