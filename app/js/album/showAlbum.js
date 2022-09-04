function showAlbum(E)
{
    const albumItem = E.path[0];

    if (!albumItem.classList.contains('albumItem')) return;

    const albumName = albumItem.dataset.albumName;
};

document.querySelector('section.album .body').addEventListener('click', showAlbum);