let FOCUS = false;

function removeFolder(E)
{
    if (FOCUS === false || E.path[0].tagName !== 'IMG') return;

    const { json } = require('./js/util');

    const
        folderItem = E.path[1],
        path = folderItem.dataset.path,

        config = new json('app/config.json'),
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
            x.classList.remove('show');
            x.classList.add('hide');
        });

        FOCUS = false;
    }

    else
    {
        span.innerHTML = 'Done';
        removeFolder.style.borderColor = 'var(--accent)';

        deleteFolder.forEach((x) =>
        {
            x.classList.add('show');
            x.classList.remove('hide');
        });

        FOCUS = true;
    }
};

document.getElementById('removeFolder').addEventListener('click', shiftFocus);
document.getElementById('folders').addEventListener('click', removeFolder);