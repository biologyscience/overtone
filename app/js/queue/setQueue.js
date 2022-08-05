let queueReady = false;

function setQueue({detail})
{
    queueReady = false;

    const filePaths = detail;

    const { getAudioDuration } = require('./js/util');
    const { parseFile } = require('music-metadata');

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
        list.metadata.push(parseFile(x, {skipPostHeaders: true}));

        list.audioDuration.push(getAudioDuration(x));
    });

    Promise.all(list.metadata).then((x) =>
    {
        x.forEach((tags) =>
        {
            const data =
            `
            <div class="dragger flex flexCenter">
                <svg class="svgDragger hoverPointer" x="0px" y="0px" viewBox="0 0 48 48" fill="var(--dark70)">
                    <path d="M0,30.2v-3.7c0-0.2,0.1-0.3,0.3-0.3h47.4c0.2,0,0.3,0.1,0.3,0.3v3.9c0,0.2-0.1,0.3-0.3,0.3H0.5C0.2,30.8,0,30.5,0,30.2z"/>
                    <path d="M0,21.2v-3.7c0-0.2,0.1-0.3,0.3-0.3h47.4c0.2,0,0.3,0.1,0.3,0.3v3.9c0,0.2-0.1,0.3-0.3,0.3H0.5C0.2,21.8,0,21.5,0,21.2z"/>
                </svg>
            </div>
            <div class="info relative hoverPointer">
                <div class="song overflowPrevent">
                    ${tags.common?.title}
                </div>
                <div class="artist overflowPrevent">
                    ${tags.common?.albumartist}
                </div>
                <div class="album overflowPrevent">
                    ${tags.common?.album}
                </div>
            </div>
            <div class="options flex flexCenter">
                <svg class="svgOptions hoverPointer" x="0px" y="0px" viewBox="0 0 48 48" fill="var(--dark70)">
                    <path d="M3.6,27.6c-1,0-1.8-0.4-2.5-1.1C0.4,25.8,0,25,0,24c0-1,0.4-1.8,1-2.5c0.7-0.7,1.5-1.1,2.5-1.1c1,0,1.8,0.4,2.5,1.1
	                c0.7,0.7,1,1.6,1,2.5c0,1-0.4,1.8-1,2.6C5.4,27.2,4.6,27.6,3.6,27.6z M24,27.6c-1,0-1.8-0.4-2.6-1.1c-0.7-0.7-1.1-1.6-1.1-2.6
	                c0-1,0.4-1.9,1.1-2.6c0.7-0.7,1.6-1.1,2.6-1.1s1.8,0.4,2.6,1.1c0.7,0.7,1.1,1.5,1.1,2.6c0,1-0.4,1.9-1.1,2.6
	                C25.8,27.2,25,27.6,24,27.6z M44.4,27.6c-1,0-1.9-0.4-2.5-1.1c-0.7-0.7-1.1-1.6-1.1-2.6c0-1,0.3-1.9,1.1-2.6
	                c0.7-0.7,1.5-1.1,2.5-1.1s1.9,0.4,2.5,1.1C47.7,22.1,48,23,48,24c0,1-0.3,1.8-1.1,2.6C46.2,27.2,45.4,27.6,44.4,27.6z"/>
                </svg>
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