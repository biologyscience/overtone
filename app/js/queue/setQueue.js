let queueReady = false;

function showQueue(queueName)
{
    Array.from(document.getElementById('queuesHolder').children).forEach((x) =>
    {
        if (x.dataset.queueName === queueName)
        { x.classList.add('current'); }

        else { x.classList.remove('current'); }
    });

    document.dispatchEvent(new CustomEvent('-changeNavbarItemFocus', {detail: 'queue'}));

    queueReady = true;

    document.dispatchEvent(new CustomEvent('-currentQueueReady', {detail: ul}));
};

function setQueue({detail})
{
    queueReady = false;

    let
        id = 0,
        paths = util.read.queues()[detail];

    const list =
    {
        metadata: [],
        audioDuration: [],
        li: [],
        time: []
    };

    if (typeof(detail) !== 'string') paths = util.read.albums()[util.formatter(detail.album, detail.albumArtist)].songs.sort(util.sort.byTrackNumber);

    paths.forEach((x) =>
    {
        list.metadata.push(util.getMetaData(x));
            
        list.audioDuration.push(util.getAudioDuration(x));
    });

    Promise.all(list.metadata).then((x) =>
    {
        let album = x[0].album;

        const queueName = detail.album || album;

        const queuesHolder = document.getElementById('queuesHolder');

        if (Array.from(queuesHolder.children).filter(x => x.dataset.queueName === queueName).length > 0) return showQueue(queueName);

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
            
            for (let i = 0; i < list.time.length; i++)
            {
                list.li[i].querySelector('.info').dataset.songDuration = list.time[i];
        
                ul.append(list.li[i]);
            }

            queuesHolder.append(ul);

            showQueue(queueName);
        });
    });
};

['-selectedAlbum', '-chooseQueue'].forEach(x => document.addEventListener(x, setQueue));

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