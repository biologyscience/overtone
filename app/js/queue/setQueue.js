let queueReady = false;

function showQueue(queueName)
{
    Array.from(document.getElementById('content').children).forEach((x) =>
    {
        if (x.dataset.queueName === queueName)
        { x.classList.add('current'); }

        else { x.classList.remove('current'); }
    });
};

function setQueue({detail: {filePaths, queueName}})
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
            <div class="dragger flex flexCenter cursorGrab">
                <img src="svg/drag.svg" class="imgDragger" draggable="false">
            </div>
            <div class="info relative cursorPointer">
                <div class="song overflowPrevent">
                    ${tags.title}
                </div>
                <div class="artist overflowPrevent">
                    ${tags.albumArtist}
                </div>
                <div class="album overflowPrevent">
                    ${tags.album}
                </div>
            </div>
            <div class="options flex flexCenter cursorPointer">
                <img src="svg/moreHorizontal.svg" class="imgDragger" draggable="false">
            </div>
            `;

            const li = document.createElement('li');
    
            li.classList.add('currentQueueItems', 'grid');
    
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
    
            ul.classList.add('queue');

            ul.dataset.queueName = queueName;
            
            for (let i = 0; i < list.time.length; i++)
            {
                list.li[i].querySelector('.info').dataset.songDuration = list.time[i];
        
                ul.append(list.li[i]);
            }

            document.getElementById('content').append(ul);

            showQueue(queueName);

            document.dispatchEvent(new CustomEvent('-changeNavbarItemFocus', {detail: document.querySelector('.navbarItems svg#queue').parentElement.parentElement}));

            queueReady = true;

            document.dispatchEvent(new CustomEvent('-currentQueueReady', {detail: ul}));
        });
    });
};

document.addEventListener('-selectedFilePaths', setQueue);

document.addEventListener('-chooseQueue', (obj) =>
{
    let TF = false;

    const element = Array.from(document.getElementById('content').children).filter(x => x.dataset.queueName === obj.detail.queueName);

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