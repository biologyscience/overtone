let
    loop = false,
    audioDuration,
    fraction;

function fractionToPercent(frac)
{
    if (frac > 1) { return '100%'; }

    if (0 > frac) { return '0%'; }

    if (1 > frac > 0) { return `${frac.toFixed(4) * 100}%`; }
};

function setTime({detail})
{
    const time = detail;

    audioDuration = (time.minutes * 60) + time.seconds;

    const div =
    {
        currentTime: document.getElementById('currentTime'),
        totalTime: document.getElementById('totalTime')
    };

    const
        minutes = time.minutes.toString(),
        seconds = time.seconds.toString().length > 1 ? time.seconds : '0' + time.seconds;

    div.currentTime.innerHTML = '0:00';
    div.totalTime.innerHTML = `${minutes}:${seconds}`;
};

function updateTimeLine({detail})
{
    if (loop) return;

    const { parseTime } = require('./js/util');

    const div =
    {
        currentTime: document.getElementById('currentTime'),
        theLine: document.getElementById('theLine')
    };

    const
        currentTime = detail.currentTime,
        totalTime = detail.duration,
        minutes = parseTime(currentTime * 1000).minutes.toString(),
        seconds = parseTime(currentTime * 1000).seconds.toString().length > 1 ? parseTime(currentTime * 1000).seconds : '0' + parseTime(currentTime * 1000).seconds;

    div.theLine.style.setProperty('--progress', fractionToPercent(currentTime / totalTime));

    div.currentTime.innerHTML = `${minutes}:${seconds}`;
    div.theLine.querySelector('.popUp').innerHTML = `${minutes}:${seconds}`;
};

function scrollTimeLine(E)
{
    if (loop === false) return;

    const
        theLine = document.getElementById('theLine'),
        popUp = theLine.querySelector('.popUp'),
        { left, right } = theLine.getBoundingClientRect(),
        { parseTime } = require('./js/util');

    const
        totalWidth = right - left,
        num = E.x - left;

    fraction = num / totalWidth;

    document.getElementById('theLine').style.setProperty('--progress', fractionToPercent(fraction));

    const
        currentTime = audioDuration * fraction,
        minutes = parseTime(currentTime * 1000).minutes.toString(),
        seconds = parseTime(currentTime * 1000).seconds.toString().length > 1 ? parseTime(currentTime * 1000).seconds : '0' + parseTime(currentTime * 1000).seconds;

    popUp.innerHTML = `${minutes}:${seconds}`;
};

function endScrollTimeLine()
{
    if (loop === false) return;

    loop = false;

    document.dispatchEvent(new CustomEvent('-timeChange', {detail: fraction}));
};

document.getElementById('theLine').addEventListener('mousedown', (E) => { loop = true; scrollTimeLine(E); });
document.getElementById('theLine').addEventListener('mouseup', endScrollTimeLine);
document.getElementById('theLine').addEventListener('mouseleave', endScrollTimeLine);
document.getElementById('theLine').addEventListener('mousemove', scrollTimeLine);

document.addEventListener('-setTime', setTime);
document.addEventListener('-updateTimeLine', updateTimeLine);