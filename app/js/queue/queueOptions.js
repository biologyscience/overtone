function openQueueOptions({detail})
{
    const target = detail;

    const
        queueOptions = document.getElementById('queueOptions'),
        queueLI = target.parentElement;

    queueOptions.dataset.queueNameHash = util.formatter(queueLI.querySelector('.queueName').innerText);

    const { top, height } = queueLI.getBoundingClientRect();

    queueOptions.style.setProperty('--top', `calc(${top - (height / 2)}px)`);

    queueOptions.classList.add('visible');
};

function closeQueueOptions()
{
    const
        queueOptions = document.getElementById('queueOptions'),
        options = Array.from(queueOptions.children);

    queueOptions.classList.remove('visible');

    Array.from(document.getElementById('queueList').children).forEach((x) =>
    {
        x.querySelector('span').classList.remove('displayNone');
        x.querySelector('input').classList.add('displayNone');
    });

    options.forEach(x => x.classList.remove('displayNone'));
    options[0].classList.add('displayNone');
};

function queueOptions({target})
{
    const queueOptions = document.getElementById('queueOptions');

    if (target.dataset.function === 'rename')
    {
        Array.from(queueOptions.children).forEach(x => x.classList.toggle('displayNone'));
        queueOptions.style.setProperty('--top', queueOptions.style.getPropertyValue('--top').split(')').join(' + 1em)'));

        const
            queueName = document.querySelector(`#queueList [data-queue-name-hash="${queueOptions.dataset.queueNameHash}"`).innerText,
            queueLI = document.querySelector(`#queueList [data-queue-name-hash="${util.formatter(queueName)}"]`).parentElement,
            span = queueLI.querySelector('span'),
            input = queueLI.querySelector('input');

        span.classList.add('displayNone');
        input.value = queueName;
        input.classList.remove('displayNone');
        input.focus();
    }

    if (target.dataset.function === 'renameDone')
    {
        Array.from(queueOptions.children).forEach(x => x.classList.toggle('displayNone'));
        queueOptions.style.setProperty('--top', queueOptions.style.getPropertyValue('--top').split(' + 1em)').join(')'));

        const
            oldQueueName = document.querySelector(`#queueList [data-queue-name-hash="${queueOptions.dataset.queueNameHash}"`).innerText,
            queueLI = document.querySelector(`#queueList [data-queue-name-hash="${util.formatter(oldQueueName)}"]`).parentElement,
            span = queueLI.querySelector('span'),
            input = queueLI.querySelector('input'),
            newQueueName = input.value;

        span.classList.remove('displayNone');
        input.classList.add('displayNone');

        queueOptions.classList.remove('visible');

        if (oldQueueName === newQueueName) return;

        const
            queues = new util.json('app/json/queues.json'),
            queuesData = queues.read();
        
        queuesData.queueOrder[queuesData.queueOrder.indexOf(oldQueueName)] = newQueueName;
        queuesData[newQueueName] = queuesData[oldQueueName];
        delete queuesData[oldQueueName];
        queues.save();

        const queueList = document.querySelector(`#queuesHolder [data-queue-name-hash="${util.formatter(oldQueueName)}"]`);
        
        if (queueList?.classList?.contains('current'))
        {
            queueList.dataset.queueNameHash = util.formatter(newQueueName);
            document.getElementById('queueName').innerHTML = newQueueName;
            
            document.dispatchEvent(new CustomEvent('-setVariables', {detail: {QueueName: newQueueName}}));
        }

        span.innerHTML = newQueueName;
        span.dataset.queueNameHash = util.formatter(newQueueName);
    }

    if (target.dataset.function === 'remove')
    {
        const
            queueName = document.querySelector(`#queueList [data-queue-name-hash="${queueOptions.dataset.queueNameHash}"`).innerText,
            queues = new util.json('app/json/queues.json'),
            queuesData = queues.read();

        delete queuesData[queueName];
        queuesData.queueOrder.splice(queuesData.queueOrder.indexOf(queueName), 1);
        queues.save();

        const queueLI = document.querySelector(`#queueList [data-queue-name-hash="${util.formatter(queueName)}"]`).parentElement;

        if (queueLI?.classList?.contains('current'))
        {
            const
                queueItems = Array.from(document.getElementById('queueList').children),
                index = queueItems.indexOf(queueLI);

            let toChoose = index;

            index === (queueItems.length - 1) ? toChoose-- : toChoose++;

            if (queueItems.length === 1) return document.dispatchEvent(new Event('-resetDisplayRight'));
            
            chooseQueue(queueItems[toChoose].querySelector('span'));
            
            document.dispatchEvent(new CustomEvent('-setPlayingQueueBorder', {detail: queueItems[toChoose]}));

            setTimeout(() => { document.querySelector('#queuesHolder ul.current li .info').click(); });
        }
        
        queueLI.remove();

        queueOptions.classList.remove('visible');
    }
};

document.addEventListener('-openQueueOptions', openQueueOptions);
document.addEventListener('-closeQueueOptions', closeQueueOptions);
document.getElementById('queueOptions').addEventListener('click', queueOptions);