let interval;

function updateTimeLine({detail})
{
    const audio = detail;

    const util = require('./js/util');

    const div =
    {
        currentTime: document.getElementById('currentTime'),
        theLine: document.getElementById('theLine'),
        totalTime: document.getElementById('totalTime')
    };

    audio.addEventListener('loadeddata', () =>
    {
        const
            totalTime = util.parseTime(audio.duration * 1000),
            minutes = totalTime.minutes.toString(),
            seconds = totalTime.seconds.toString().length > 1 ? totalTime.seconds : '0' + totalTime.seconds;
    
        div.totalTime.innerHTML = minutes + ':' + seconds;
        div.currentTime.innerHTML = '0:00';
    });

    audio.addEventListener('play', () =>
    {
        interval = setInterval(() =>
        {
            const
                currentTime = audio.currentTime,
                totalTime = audio.duration,
                minutes = util.parseTime(currentTime * 1000).minutes.toString(),
                seconds = util.parseTime(currentTime * 1000).seconds.toString().length > 1 ? util.parseTime(currentTime * 1000).seconds : '0' + util.parseTime(currentTime * 1000).seconds,
                number = getComputedStyle(div.theLine).getPropertyValue('--maxWidth').split('%')[0];

            div.theLine.style.width = ((currentTime / totalTime) * parseInt(number)).toFixed(2) + '%';

            div.currentTime.innerHTML = minutes + ':' + seconds;
        }, 1000);
    });

    audio.addEventListener('pause', () =>
    {
        clearInterval(interval);

        interval = '';
    });
};

document.addEventListener('-audio', updateTimeLine);