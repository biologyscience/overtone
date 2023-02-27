function showArtist({currentTarget: {innerText}})
{
    const
        currentTarget = document.querySelector(`section.artist .out .body .artistItem[data-artist="${innerText}"]`),
        offset = document.querySelector('section.artist .out .head').offsetHeight + document.getElementById('titleBar').offsetHeight;
    
    document.querySelector('nav ul li[data-display-section="artist"]').click();

    document.querySelector('section.artist .out .body').scrollTo({top: currentTarget.offsetTop - offset});

    currentTarget.click();
    
    currentTarget.classList.add('focus');
};

document.getElementById('albumArtistInAlbumItem').addEventListener('click', showArtist);