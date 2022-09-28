let queueReady = false;

function showQueue(queueName)
{
    Array.from(document.getElementById('queuesHolder').children).forEach((x) =>
    {
        if (x.dataset.queueName === queueName)
        { x.classList.add('current'); }

        else { x.classList.remove('current'); }
    });
};

function setQueue({detail: {filePaths, queueName, position}})
{
    queueReady = false;

    let id = 0;

    const { getAudioDuration, getMetaData } = require('./js/util');

    const list =
    {
        metadata: [],
        audioDuration: [],
        li: [],
        time: []
    };

    filePaths.forEach((x) =>
    {
        list.metadata.push(getMetaData(x));

        list.audioDuration.push(getAudioDuration(x));
    });

    Promise.all(list.metadata).then((x) =>
    {
        x.forEach((tags) =>
        {
            const data =
            `
            <div class="dragger flexCenter cursorGrab">
                <img src="svg/drag.svg" draggable="false">
            </div>
            <div class="info flexCol relative cursorPointer">
                <span class="overflowPrevent">${tags.title}</span>
                <span class="overflowPrevent">${tags.albumArtist}</span>
                <span class="overflowPrevent">${tags.album}</span>
            </div>
            <button class="options flexCenter cursorPointer">
                <img src="svg/moreHorizontal.svg" draggable="false">
            </button>
            `;

            const li = document.createElement('li');
    
            li.classList.add('grid');
    
            li.innerHTML = data;

            li.dataset.id = id;

            list.li.push(li);

            id++;
        });

        Promise.all(list.audioDuration).then((x) =>
        {
            x.forEach((time) =>
            {
                const
                    minutes = time.minutes.toString(),
                    seconds = time.seconds.toString().length > 1 ? time.seconds : '0' + time.seconds;
    
                list.time.push(minutes + ':' + seconds);
            });

            const ul = document.createElement('ul');

            ul.dataset.queueName = queueName;
            ul.dataset.position = `${position}. `;
            
            for (let i = 0; i < list.time.length; i++)
            {
                list.li[i].querySelector('.info').dataset.songDuration = list.time[i];
        
                ul.append(list.li[i]);
            }

            document.getElementById('queuesHolder').append(ul);

            showQueue(queueName);

            document.dispatchEvent(new CustomEvent('-changeNavbarItemFocus', {detail: 'queue'}));

            queueReady = true;

            document.dispatchEvent(new CustomEvent('-currentQueueReady', {detail: ul}));
        });
    });
};

document.addEventListener('-selectedFilePaths', setQueue);

document.addEventListener('-chooseQueue', (obj) =>
{
    const element = Array.from(document.getElementById('queuesHolder').children).filter(x => x.dataset.queueName === obj.detail.queueName);

    element.length > 0 ? showQueue(obj.detail.queueName) : setQueue(obj);
});

document.addEventListener('-current', (obj) =>
{
    const int = setInterval(() => 
    {
        if (queueReady)
        {
            clearInterval(int);

            document.dispatchEvent(new CustomEvent('-setBorder', obj));
        }
    });
});