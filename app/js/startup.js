/**
 * display
 */
let a = setTimeout(() =>
{
    let y = document.getElementById('navbar').offsetHeight;

    Array.from(document.getElementById('div-queue').children).forEach(x => x.id === 'content' ? null : y = y + x.offsetHeight);

    document.getElementById('content').style.height = `calc(100vh - ${y + 2}px)`;
});

let b = setTimeout(() =>
{
    document.getElementById('displayLeft').classList.remove('opacity0', 'visibilityHidden');
    document.getElementById('displayRight').classList.remove('opacity0', 'visibilityHidden');
}, 100);

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
let e = setTimeout(() => document.dispatchEvent(new Event('-navbarStartup')), 500);


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
    [a, b, c, d, e, timeout].forEach((x) =>
    {
        clearTimeout(x);

        x = null;
    });
}, 2 * 1000);