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

    const int = util.fractionToPercent(num / totalHeight, 0).split('%')[0];

    volumeSlider.style.setProperty('--progress', `${int}%`);
    
    volumeFloat.dataset.percent = int;

    document.dispatchEvent(new CustomEvent('-volumeChange', {detail: int / 100}));
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

volumeSlider.style.setProperty('--progress', `${util.read.config().volume * 100}%`);
volumeFloat.dataset.percent = util.read.config().volume * 100;