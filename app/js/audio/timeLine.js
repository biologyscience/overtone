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

    const div =
    {
        currentTime: document.getElementById('currentTime'),
        theLine: document.getElementById('theLine')
    };

    const
        currentTime = detail.currentTime,
        totalTime = detail.duration,
        minutes = util.parseTime(currentTime * 1000).minutes.toString(),
        seconds = util.parseTime(currentTime * 1000).seconds.toString().length > 1 ? util.parseTime(currentTime * 1000).seconds : '0' + util.parseTime(currentTime * 1000).seconds;

    div.theLine.style.setProperty('--progress', util.fractionToPercent(currentTime / totalTime, 4));

    div.currentTime.innerHTML = `${minutes}:${seconds}`;
    div.theLine.querySelector('.popUp').innerHTML = `${minutes}:${seconds}`;
};

function scrollTimeLine(E)
{
    if (loop === false) return;

    const
        theLine = document.getElementById('theLine'),
        popUp = theLine.querySelector('.popUp'),
        { left, right } = theLine.getBoundingClientRect();

    const
        totalWidth = right - left,
        num = E.x - left;

    fraction = num / totalWidth;

    document.getElementById('theLine').style.setProperty('--progress', util.fractionToPercent(fraction, 4));

    const
        currentTime = audioDuration * fraction,
        minutes = util.parseTime(currentTime * 1000).minutes.toString(),
        seconds = util.parseTime(currentTime * 1000).seconds.toString().length > 1 ? util.parseTime(currentTime * 1000).seconds : '0' + util.parseTime(currentTime * 1000).seconds;

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