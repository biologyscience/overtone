function updateFolders()
{
    const { readConfig } = require('./js/util');

    const checkMusicIn = readConfig().checkMusicIn;

    if (checkMusicIn === undefined) return;

    const folders = document.getElementById('folders');

    const paths = [];

    Array.from(folders.children).forEach(x => paths.push(x.dataset.path));

    checkMusicIn.forEach((x) =>
    {
        if (paths.includes(x) === false)
        {
            const li = document.createElement('li');

            const name = x.split('\\');

            li.classList.add('folderItem', 'flex');

            li.dataset.path = x;

            li.innerHTML =
            `
            <img src="svg/folder.svg">
            <div class="flexCol">
                <span class="name"> ${name[name.length - 1]} </span>
                <span class="path"> ${name.join('/')} </span>
            </div>
            `;

            folders.append(li);
        }
    });

};

document.addEventListener('-updateFolders', updateFolders);

updateFolders();