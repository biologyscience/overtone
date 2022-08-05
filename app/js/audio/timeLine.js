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

    util.getAudioDuration(audio.src).then((x) =>
    {
        const
            minutes = x.minutes.toString(),
            seconds = x.seconds.toString().length > 1 ? x.seconds : '0' + x.seconds;

        div.currentTime.innerHTML = '0:00';
        div.totalTime.innerHTML = minutes + ':' + seconds;
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