function openContextMenu({detail})
{
    const { ctx, title, dataset } = detail;
    
    const leftContextMenu = document.getElementById('leftContextMenu');

    for (const x in leftContextMenu.dataset) delete leftContextMenu.dataset[x];

    for (const x in dataset) leftContextMenu.dataset[x] = dataset[x];
    
    leftContextMenu.querySelector('.head span').innerHTML = title;

    Array.from(leftContextMenu.querySelectorAll('li')).filter(x => x.classList.contains(ctx) ? x.classList.remove('displayNone') : x.classList.add('displayNone'));

    document.getElementById('displayLeftOverlay').classList.add('visible');
    leftContextMenu.classList.add('visible');
};

function closeContextMenu()
{
    [
        'displayLeftOverlay',
        'leftContextMenu',
        'queueListMenu'
    ].forEach(x => document.getElementById(x).classList.remove('visible'));

    document.dispatchEvent(new Event('-closeQueueOptions'));
};

document.addEventListener('-contextMenu', openContextMenu);
['#displayLeftOverlay', '#leftContextMenu .head .close'].forEach(x => document.querySelector(x).addEventListener('click', closeContextMenu));
document.querySelector('section.album .in .head .albumArt').addEventListener('contextmenu', () => openContextMenu({detail: {ctx: 'albumOrArtist', title: document.querySelector('section.album .in .head .content .name').innerHTML}}));

document.getElementById('songListInAlbum').addEventListener('contextmenu', ({target}) =>
{
    if (target.localName === 'ul') return;
    
    openContextMenu({detail: {ctx: 'songInList', title: target.dataset.songName, dataset: target.dataset}});   
});

document.getElementById('artistPicture').addEventListener('contextmenu', () => openContextMenu({detail: {ctx: 'albumOrArtist', title: document.querySelector('section.artist .in .head .content .name').innerHTML}}));