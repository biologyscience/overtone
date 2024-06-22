/**
 * misc
 */
let b = setTimeout(() =>
{
    document.getElementById('overlay').style.display = 'none';
    document.dispatchEvent(new Event('-AppLoaded'));
}, 1000);


/**
 * title bar font size
 */
let d = setTimeout(() =>
{
    const titleBar = document.getElementById('titleBar');
    const name = document.querySelector('#titleBar .name');

    let resizeValue = getComputedStyle(titleBar).getPropertyValue('--fs').split('px')[0];

    function resize()
    {
        if (name.offsetHeight < titleBar.offsetHeight) return;

        resizeValue = resizeValue - 0.01;

        titleBar.style.setProperty('--fs', `${resizeValue}px`);

        resize();
    };

    resize();
}, 100);

//



let timeout = setTimeout(() =>
{
    [b, d, timeout].forEach((x) =>
    {
        clearTimeout(x);

        x = null;
    });
}, 2 * 1000);












{
    const { existsSync, readFileSync } = require('fs');
    const { read } = require('./js/util');
    const { watch } = require('chokidar');

    /* watch files */
    const watcher = watch(['app/css', 'app/js', 'app/index.html']);

    watcher.on('ready', () =>
    {
        watcher.on('all', () => window.location.reload());
    });

    // /* queue list */
    // const queueList = read.queues();
    
    // queueList.forEach(detail => document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail})));

    /* fill previous id */
    if (existsSync('./app/json/config.json'))
    {
        const config = JSON.parse(readFileSync('./app/json/config.json'));
        
        if (config.discordAppID !== undefined)
        {
            const discordAppID = document.getElementById('discordAppID');
            discordAppID.value = config.discordAppID;

            const font = config.font;
            document.dispatchEvent(new CustomEvent('-setFont', {detail: font}));
        }
    }
        
    /* fill the folders */
    const checkMusicIn = read.config().checkMusicIn;
    
    if (checkMusicIn !== undefined)
    {
        const folders = document.getElementById('folders');
        
        const paths = Array.from(folders.children).map(x => x.dataset.path);
        
        checkMusicIn.forEach((x) =>
        {
            if (paths.includes(x) === false)
            {
                const li = document.createElement('li');
                
                const name = x.split('\\');
                
                li.classList.add('folderItem', 'grid');
                
                li.dataset.path = x;
                
                li.innerHTML =
                `
                <img class="folder" src="svg/folder.svg">
                <div class="flexCol">
                    <span class="name">${name[name.length - 1]}</span>
                    <span class="path">${name.join('/')}</span>
                </div>
                <img src="svg/close.svg" class="deleteFolder pointerEventsNone">
                `;
                
                folders.append(li);
            }
        });
    }
}