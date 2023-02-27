let FOCUS = false;

function removeFolder(E)
{
    if (FOCUS === false || E.target.tagName !== 'IMG') return;

    const { json } = require('./js/util');

    const
        folderItem = E.parentElement,
        path = folderItem.dataset.path,

        config = new json('app/json/config.json'),
        data = config.read(),
        index = data.checkMusicIn.indexOf(path);

    data.checkMusicIn.splice(index, 1);

    config.save();

    Array.from(document.getElementById('folders').children).filter(x => x.dataset.path === path)[0].remove();

    shiftFocus();
};

function shiftFocus()
{
    const
        removeFolder = document.getElementById('removeFolder'),
        span = removeFolder.querySelector('span'),
        deleteFolder = document.querySelectorAll('.deleteFolder');
    
    if (FOCUS)
    {
        span.innerHTML = 'Remove a folder';
        removeFolder.style.borderColor = '';

        deleteFolder.forEach((x) =>
        {
            x.animate([
                {
                    opacity: 1,
                    transform: 'rotate(360deg)'
                },

                {
                    opacity: 1,
                    offset: 0.6
                },
                
                {
                    opacity: 0,
                    transform: 'rotate(0deg)'
                }
            ], {duration: 1000, easing: 'ease', fill: 'forwards'});
        });

        FOCUS = false;

        deleteFolder.forEach(x => x.classList.add('pointerEventsNone'));
    }

    else
    {
        deleteFolder.forEach(x => x.classList.remove('pointerEventsNone'));
        
        span.innerHTML = 'Done';
        removeFolder.style.borderColor = 'var(--accent)';

        deleteFolder.forEach((x) =>
        {
            x.animate([
                {
                    opacity: 0,
                    transform: 'rotate(0deg)'
                },

                {
                    opacity: 1,
                    offset: 0.4
                },
                
                {
                    opacity: 1,
                    transform: 'rotate(360deg)'
                }
            ], {duration: 1000, easing: 'ease', fill: 'forwards'});
        });

        FOCUS = true;
    }
};

document.getElementById('removeFolder').addEventListener('click', shiftFocus);
document.getElementById('folders').addEventListener('click', removeFolder);