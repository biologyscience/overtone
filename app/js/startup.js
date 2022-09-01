let a = setTimeout(() =>
{
    // floating queue list
    const titleHolder = document.querySelector('.titleHolder');

    const queueListMenu = document.getElementById('queueListMenu');

    const math = queueListMenu.offsetHeight - (titleHolder.offsetHeight + 2);

    document.getElementById('queueList').style.height = `${math}px`;

    // queue content
    let contentHeight = 0;

    Array.from(document.querySelector('section.queue').children).forEach(x => x.id === 'content' ? null : contentHeight = contentHeight + x.offsetHeight);

    document.getElementById('content').style.height = `calc(var(--displayHeight) - ${contentHeight + 2}px)`;
    
    // folderIn list
    let songListInFolderHeight = 0;
    
    Array.from(document.querySelector('section.folder .in').children).forEach(x => x.id === 'songListInFolder' ? null : songListInFolderHeight = songListInFolderHeight + x.offsetHeight);

    document.getElementById('songListInFolder').style.height = `calc(var(--displayHeight) - ${songListInFolderHeight + 2}px)`;

    // display none to divs
    [
        'section.queue',
        '#queueListMenu',

        'section.folder',
        'section.folder .in',

        'section.album', 'section.artist', 'section.genre', 'section.library', 'section.extras', 'section.search'
    ].forEach(x => document.querySelector(x).classList.add('displayNone'));

});

/**
 * misc
 */
let b = setTimeout(() => { document.getElementById('overlay').style.display = 'none'; }, 1000);


/**
 * navbar
 */
let c = setTimeout(() => document.dispatchEvent(new Event('-navbarStartup')), 500);


/**
 * queue list
 */
{
    const { read } = require('./js/util');

    const queueList = read.queues();

    for (detail in queueList)
    {
        document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail}));
    }
}

//



let timeout = setTimeout(() =>
{
    [a, b, c, timeout].forEach((x) =>
    {
        clearTimeout(x);

        x = null;
    });
}, 2 * 1000);















{
    const { existsSync, readFileSync } = require('fs');
    const { read } = require('./js/util');

    /* fill previous id */
    if (existsSync('./app/json/config.json'))
    {
        const config = JSON.parse(readFileSync('./app/json/config.json'));
        
        if (config.discordAppID !== undefined)
        {
            const discordAppID = document.getElementById('discordAppID');
            
            discordAppID.value = config.discordAppID;
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