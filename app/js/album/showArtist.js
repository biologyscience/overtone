function showArtist({target: {innerText}})
{
    const
        target = document.querySelector(`section.artist .out .body .artistItem[data-artist="${innerText}"]`),
        offset = document.querySelector('section.artist .out .head').offsetHeight + document.getElementById('titleBar').offsetHeight;
    
    document.querySelector('nav ul li[data-display-section="artist"]').click();

    document.querySelector('section.artist .out .body').scrollTo({top: target.offsetTop - offset});

    target.click();
    
    target.classList.add('focus');
};

document.getElementById('albumArtistInAlbumItem').addEventListener('click', showArtist);