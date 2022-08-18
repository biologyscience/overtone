/**
 * display
 */
let a = setTimeout(() =>
{
    let y = document.getElementById('navbar').offsetHeight;

    Array.from(document.getElementById('div-queue').children).forEach(x => x.id === 'content' ? null : y = y + x.offsetHeight);

    document.getElementById('content').style.height = `calc(100vh - ${y + 2}px)`;
});

let f = setTimeout(() =>
{
    document.dispatchEvent(new Event('-navbarStartup'));

    const x = document.getElementById('div-folder');

    x.style.height = `${x.offsetHeight - 2}px`;
});

let b = setTimeout(() =>
{
    document.getElementById('displayLeft').classList.remove('opacity0', 'visibilityHidden');
    document.getElementById('displayRight').classList.remove('opacity0', 'visibilityHidden');
}, 1000);
/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */

/**
 * misc
 */
let c = setTimeout(() => { document.getElementById('loading').classList.add('displayNone') }, 900);

let d = setTimeout(() =>
{
    const x = document.querySelector('.titleHolder').offsetHeight;

    const y = document.getElementById('queueListMenu').offsetHeight;

    const math = y - (x + 2);

    document.getElementById('queueList').style.height = `${math}px`;

    document.getElementById('queueListMenu').classList.replace('visibilityHidden', 'displayNone');
});

/**
 * navbar
 */
let e = setTimeout(() => document.dispatchEvent(new Event('-navbarStartup')), 900);


/**
 * queue list
 */
{
    const { json } = require('./js/util');

    const queueList = new json('app/queues.json').read();

    for (detail in queueList)
    {
        document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail}));
    }
}

//

let timeout = setTimeout(() =>
{
    [a, b, c, d, e, timeout, f].forEach((x) =>
    {
        clearTimeout(x);

        x = null;
    });
}, 2 * 1000);


















{
    const { existsSync, readFileSync } = require('fs');
    const { readConfig } = require('./js/util');

    /* fill previous id */
    if (existsSync('app/config.json'))
    {
        const config = JSON.parse(readFileSync('app/config.json'));
        
        if (config.discordAppID !== undefined)
        {
            const discordAppID = document.getElementById('discordAppID');
            
            discordAppID.value = config.discordAppID;
        }
    }
        
    /* fill the folders */
    const checkMusicIn = readConfig().checkMusicIn;
    
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
                <img src="svg/close.svg" class="deleteFolder hide">
                `;
                
                folders.append(li);
            }
        });
    }
}