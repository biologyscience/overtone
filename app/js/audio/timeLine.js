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

document.addEventListener('-setTime', setTime);
document.addEventListener('-updateTimeLine', updateTimeLine);