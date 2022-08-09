let queueReady = false;

function setQueue({detail})
{
    queueReady = false;

    const filePaths = detail;

    const { getAudioDuration, getMetaData } = require('./js/util');

    const ul = document.getElementById('currentQueueList');

    Array.from(ul.children).forEach(x => x.remove());

    const list =
    {
        metadata: [],
        audioDuration: [],
        li: [],
        time: []
    }

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
            <div class="dragger flex flexCenter">
                <img src="svg/drag.svg" class="imgDragger hoverPointer" draggable="false">
            </div>
            <div class="info relative hoverPointer">
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
            <div class="options flex flexCenter">
                <img src="svg/moreHorizontal.svg" class="imgDragger hoverPointer" draggable="false">
            </div>
            `;

            const li = document.createElement('li');
    
            li.classList.add('currentQueueItems', 'grid');
    
            li.innerHTML = data;

            list.li.push(li);
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
    
            for (let i = 0; i < list.time.length; i++)
            {
                list.li[i].querySelector('.info').dataset.songDuration = list.time[i];

                ul.append(list.li[i]);
            }

            document.dispatchEvent(new CustomEvent('-changeNavbarItemFocus', {detail: document.querySelector('.navbarItems svg#queue').parentElement.parentElement}));

            queueReady = true;
        });
    });
};

document.addEventListener('-selectedFilePaths', setQueue)

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