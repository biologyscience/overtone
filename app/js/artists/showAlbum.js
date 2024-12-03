function showAlbum(E)
{
    const { albumName } = E.target.dataset;

    const
        artistName = document.querySelector('section.artist .in .head .content .name').textContent,
        target = document.querySelector(`section.album .out .body .albumItem[data-id="${util.formatter(albumName, artistName)}"]`),
        offset = document.querySelector('section.album .out .head').offsetHeight + document.getElementById('titleBar').offsetHeight;
    
    document.querySelector('nav ul li[data-display-section="album"]').click();

    document.querySelector('section.album .out .body').scrollTo({top: target.offsetTop - offset});

    target.click();
    
    target.classList.add('focus');
};

document.getElementById('albumListInArtist').addEventListener('click', showAlbum);