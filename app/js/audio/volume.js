let scrolling = false;

const
    volumeFloat = document.querySelector('.volumeHousing .float'),
    volumeSlider = volumeFloat.querySelector('.slider');

function scrollVolume(E)
{
    if (scrolling === false) return;

    const
        { top, bottom } = volumeSlider.getBoundingClientRect(),
        totalHeight = bottom - top,
        num = bottom - E.y;

    fraction = num / totalHeight;

    const percent = fractionToPercent(fraction, 0);

    volumeSlider.style.setProperty('--progress', percent);
    
    volumeFloat.dataset.percent = percent.split('%')[0];
};

function endScrollVolume()
{
    if (scrolling === false) return;

    scrolling = false;
};

document.getElementById('volumeControl').addEventListener('click', () => volumeFloat.classList.toggle('visible'));
volumeSlider.addEventListener('mousedown', (E) => { scrolling = true; scrollVolume(E); });
volumeFloat.addEventListener('mousemove', scrollVolume);
volumeFloat.addEventListener('mouseup', endScrollVolume);
volumeFloat.addEventListener('mouseleave', endScrollVolume);