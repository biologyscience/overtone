function setTime({detail})
{
    const time = detail;

    const div =
    {
        currentTime: document.getElementById('currentTime'),
        totalTime: document.getElementById('totalTime')
    };

    const
        minutes = time.minutes.toString(),
        seconds = time.seconds.toString().length > 1 ? time.seconds : '0' + time.seconds;

    div.currentTime.innerHTML = '0:00';
    div.totalTime.innerHTML = minutes + ':' + seconds;
};

function updateTimeLine({detail})
{
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

    div.currentTime.innerHTML = minutes + ':' + seconds;
};

let
    loop = false,
    fraction;

function mouseDOWN(E)
{
    loop = true;

    const { left, right } = document.getElementById('theLine').getBoundingClientRect();

    const
        totalWidth = right - left,
        num = E.x - left;

    fraction = num / totalWidth;

    document.getElementById('theLine').style.setProperty('--width', `${fraction.toFixed(4) * 100}%`);
};

function mouseMOVE(E)
{
    if (loop === false) return;

    const { left, right } = document.getElementById('theLine').getBoundingClientRect();

    const
        totalWidth = right - left,
        num = E.x - left;

    fraction = num / totalWidth;

    document.getElementById('theLine').style.setProperty('--width', `${fraction.toFixed(4) * 100}%`);
};

function loopFALSE()
{
    if (loop === false) return;

    loop = false;

    document.dispatchEvent(new CustomEvent('-timeChange', {detail: fraction}));
}

document.getElementById('theLine').addEventListener('mousedown', mouseDOWN);
document.getElementById('theLine').addEventListener('mouseup', loopFALSE);
document.getElementById('theLine').addEventListener('mouseleave', loopFALSE);
document.getElementById('theLine').addEventListener('mousemove', mouseMOVE);

document.addEventListener('-setTime', setTime);
document.addEventListener('-updateTimeLine', updateTimeLine);