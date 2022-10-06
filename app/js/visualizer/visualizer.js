let
    visualizerOnce = false,
    analyser;

function visualizer()
{
    requestAnimationFrame(visualizer);
    
    const freqArray = new Uint8Array(analyser.frequencyBinCount);

    analyser.getByteFrequencyData(freqArray);

    const
        audioVisualizers = document.getElementById('audioVisualizers'),

        canvas =
        {
            bass: audioVisualizers.querySelector('.bass'),
            vocals: audioVisualizers.querySelector('.vocals'),
            highHats: audioVisualizers.querySelector('.highHats')
        },

        bass = canvas.bass.getContext('2d'),
        vocals = canvas.vocals.getContext('2d'),
        highHats = canvas.highHats.getContext('2d'),

        height = 
        {
            bass: canvas.bass.height,
            vocals: canvas.vocals.height,
            highHats: canvas.highHats.height
        },

        width =
        {
            bass: canvas.bass.width,
            vocals: canvas.vocals.width,
            highHats: canvas.highHats.width
        },

        range =
        {
            bass: canvas.bass.dataset.range.split('-').map(x => parseInt(x)),
            vocals: canvas.vocals.dataset.range.split('-').map(x => parseInt(x)),
            highHats: canvas.highHats.dataset.range.split('-').map(x => parseInt(x)),
        };

    bass.clearRect(0, 0, width.bass, height.bass);
    vocals.clearRect(0, 0, width.vocals, height.vocals);
    highHats.clearRect(0, 0, width.highHats, height.highHats);

    bass.fillStyle = '#65ffa0';
    vocals.fillStyle = '#65ffa0';
    highHats.fillStyle = '#65ffa0';

    const
        barWidth = parseInt(audioVisualizers.dataset.barWidth),
        barGap = parseInt(audioVisualizers.dataset.barGap);
    
    for (let i = range.bass[0]; i < range.bass[1]; i++)
    {
        const
            x = i * barGap,
            y = height.bass,
            w = barWidth,
            h = -(freqArray[i] / 3);

        bass.fillRect(x, y, w, h);
    }

    for (let i = range.vocals[0], pos = 0; i < range.vocals[1]; i++ && pos++)
    {
        const
            x = pos * barGap,
            y = height.vocals,
            w = barWidth,
            h = -(freqArray[i] / 3);

        vocals.fillRect(x, y, w, h);
    }

    for (let i = range.highHats[0], pos = 0; i < range.highHats[1]; i++ && pos++)
    {
        const
            x = pos * barGap,
            y = height.highHats,
            w = barWidth,
            h = -(freqArray[i] / 3);

        highHats.fillRect(x, y, w, h);
    }
};

document.addEventListener('-audioAnalyser', ({detail}) =>
{
    if (visualizerOnce) return;

    visualizerOnce = true;

    analyser = detail;

    visualizer();
});