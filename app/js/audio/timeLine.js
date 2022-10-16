let
    loop = false,
    audioDuration,
    fraction;

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

    div.theLine.style.setProperty('--width', `${(currentTime / totalTime).toFixed(4) * 100}%`);

    div.currentTime.innerHTML = `${minutes}:${seconds}`;
    div.theLine.querySelector('.line').dataset.currentTime = `${minutes}:${seconds}`;
};

function scrollTimeLine(E)
{
    if (loop === false) return;

    const
        theLine = document.getElementById('theLine'),
        line = theLine.querySelector('.line'),
        { left, right } = theLine.getBoundingClientRect(),
        { parseTime } = require('./js/util');

    const
        totalWidth = right - left,
        num = E.x - left;

    fraction = num / totalWidth;

    document.getElementById('theLine').style.setProperty('--width', `${fraction.toFixed(4) * 100}%`);

    const
        currentTime = audioDuration * fraction,
        minutes = parseTime(currentTime * 1000).minutes.toString(),
        seconds = parseTime(currentTime * 1000).seconds.toString().length > 1 ? parseTime(currentTime * 1000).seconds : '0' + parseTime(currentTime * 1000).seconds;

    line.dataset.currentTime = `${minutes}:${seconds}`;
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