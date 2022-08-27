let
    wait = false,
    lastInput;

function search()
{
    if (wait) return;

    wait = true;
    
    const input = document.getElementById('searchInput');

    const songListInFolder = document.getElementById('songListInFolder');

    if (lastInput === input.value.toLowerCase()) return wait = false;

    lastInput = input.value.toLowerCase();

    const children = Array.from(songListInFolder.children);

    children.forEach(x => x.classList.remove('displayNone'));

    children
    .filter(x => !x.dataset.title.includes(lastInput))
    .forEach(x => x.classList.add('displayNone'));

    setTimeout(() =>
    {
        wait = false;

        if (lastInput === input.value.toLowerCase()) return;

        search();
    }, 500);
};

document.addEventListener('-folderReady', () =>
{
    document.getElementById('searchInput').addEventListener('input', search);
});