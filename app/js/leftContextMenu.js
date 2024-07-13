function openContextMenu({detail})
{
    const { ctx, title, dataset } = detail;
    
    const leftContextMenu = document.getElementById('leftContextMenu');

    for (const x in dataset) leftContextMenu.dataset[x] = dataset[x];
    
    leftContextMenu.querySelector('.head span').innerHTML = title;

    Array.from(leftContextMenu.querySelectorAll('li')).filter(x => x.classList.contains(ctx) ? x.classList.remove('displayNone') : x.classList.add('displayNone'));

    document.getElementById('displayLeftOverlay').classList.add('visible');
    leftContextMenu.classList.add('visible');
};

function closeContextMenu()
{
    document.getElementById('displayLeftOverlay').classList.remove('visible');
    document.getElementById('leftContextMenu').classList.remove('visible');

    const queueListMenu = document.getElementById('queueListMenu');

    if (queueListMenu.classList.contains('visible')) queueListMenu.classList.remove('visible');
};

document.addEventListener('-contextMenu', openContextMenu);
['#displayLeftOverlay', '#leftContextMenu .head .close'].forEach(x => document.querySelector(x).addEventListener('click', closeContextMenu));