const audio = new Audio();

function start({detail})
{
    const filePaths = detail;

    const metadata = require('music-metadata');

    audio.src = filePaths[0];

    metadata.parseFile(filePaths[0]).then(tags => document.dispatchEvent(new CustomEvent('-updateMetaData', {detail: tags})));

    document.dispatchEvent(new CustomEvent('-audio', {detail: audio}));
        
    pauseORplay(); 
};

function pauseORplay(x)
{
    if (audio.paused)
    {
        if (audio.src.length === 0)
        {
            if (x)
            { return alert('Choose a song first !'); }
        }

        else { audio.play(); }
    }

    else { audio.pause(); }
};

function changeCurrentState(E)
{
    if (E.type === 'pause')
    {
        document.getElementById('albumArtWrapper').style.transform = 'scale(0.98)';

        ['imgPause', 'imgPlay'].forEach(x => document.getElementById(x).classList.toggle('opacity0'));
    }

    else
    {
        document.getElementById('albumArtWrapper').style.transform = '';

        ['imgPause', 'imgPlay'].forEach(x => document.getElementById(x).classList.toggle('opacity0'));
    }
};


document.getElementById('pauseORplay').onclick = pauseORplay;

audio.addEventListener('pause', changeCurrentState);
audio.addEventListener('play', changeCurrentState);

document.addEventListener('-selectedFilePaths', (data) =>
{
    pauseORplay();

    setTimeout(() => { start(data) });
});