import { useEffect, useRef } from 'react';
import eventBus from './events';

function AudioPlayer({playerRef, file, setCurrentTime, progress: [progressPercent, force], playing, audioLevel, indicateEnd})
{
    const preGainRef = useRef();
    const filtersRef = useRef();

    const fadeRef = useRef({step: 0.05, duration: 250});

    useEffect(() =>
    {
        if (!force) return;
        
        playerRef.current.currentTime = (progressPercent || 0) * (playerRef.current.duration || 0) / 100;

    }, [progressPercent, force]);

    useEffect(() =>
    {
        playerRef.current.pause();
        playerRef.current.src = file;

        setCurrentTime(0);

    }, [file]);

    useEffect(() =>
    {
        if (file === undefined) return;

        clearInterval(fadeRef.current.timer);

        if (playing)
        {
            playerRef.current.play();
            playerRef.current.volume = 0;

            const fadeInterval = fadeRef.current.duration / ((audioLevel / 100) / fadeRef.current.step);

            fadeRef.current.timer = setInterval(() =>
            {
                if ((playerRef.current.volume + fadeRef.current.step) >= (audioLevel / 100))
                {
                    playerRef.current.volume = audioLevel / 100;

                    clearInterval(fadeRef.current.timer);
                }

                else playerRef.current.volume = parseFloat((playerRef.current.volume + fadeRef.current.step).toFixed(3));
            }, fadeInterval);
        }

        else
        {
            const fadeInterval = fadeRef.current.duration / (playerRef.current.volume / fadeRef.current.step);

            fadeRef.current.timer = setInterval(() =>
            {
                if ((playerRef.current.volume - fadeRef.current.step) <= 0)
                {
                    playerRef.current.volume = 0;
                    playerRef.current.pause();

                    clearInterval(fadeRef.current.timer);
                }

                else playerRef.current.volume = parseFloat((playerRef.current.volume - fadeRef.current.step).toFixed(3));
            }, fadeInterval);
        }

    }, [file, playing]);


    useEffect(() => { playerRef.current.volume = (audioLevel || 100) / 100; }, [audioLevel]);

    useEffect(() =>
    {
        const audioPlayer = playerRef.current;

        if (audioPlayer === null) return;

        let lastTime = -1;

        function updateTime()
        {
            const { currentTime } = audioPlayer;

            if (Math.abs(currentTime - lastTime) >= 1)
            {
                lastTime = currentTime;

                setCurrentTime(lastTime);
            }
        }

        function init()
        {
            const ctx = new AudioContext();

            const source = ctx.createMediaElementSource(audioPlayer);
            const analyser = ctx.createAnalyser();

            preGainRef.current = ctx.createGain();

            const bands = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

            const filters = bands.map((band) =>
            {
                const filter = ctx.createBiquadFilter();

                filter.type = 'peaking';
                filter.frequency.value = band;
                filter.Q.value = 1;
                filter.gain.value = 0;

                return filter;
            });

            filtersRef.current = filters;
            
            eventBus.dispatchEvent(new CustomEvent('ot-AnalyzerNode', {detail: analyser}));

            let node = source;

            [preGainRef.current, ...filters, analyser, ctx.destination].forEach((filter) =>
            {
                node.connect(filter);
                node = filter;
            });
        }

        function eqChange(index)
        {
            const eqs = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [2.6, 2.6, 1.3, -0.4, -2.8, -3.5, -2.6, -0.4, 1.8, 2.6]
            ];

            preGainRef.current.gain.value = Math.pow(10, -(Math.max(...eqs[index])) / 20);

            filtersRef.current.forEach((x, i) => x.gain.value = eqs[index][i]);
        }

        playerRef.current.preservesPitch = false;

        audioPlayer.addEventListener('play', init);
        audioPlayer.addEventListener('ended', () => indicateEnd(true));
        audioPlayer.addEventListener('timeupdate', updateTime);

        eventBus.addEventListener('ot-audioDeviceChange', ({detail}) => playerRef.current.setSinkId(detail));
        eventBus.addEventListener('ot-changePlaybackSpeed', ({detail}) => playerRef.current.playbackRate = detail);
        eventBus.addEventListener('ot-preservesPitch', ({detail}) => playerRef.current.preservesPitch = detail);
        eventBus.addEventListener('ot-changeFadeDuration', ({detail}) => fadeRef.current.duration = detail);
        
        return () =>
        {
            audioPlayer.removeEventListener('play', init);
            audioPlayer.removeEventListener('ended', () => indicateEnd(true));
            audioPlayer.removeEventListener('timeupdate', updateTime);
        }
    }, []);

    return <audio ref={playerRef}/>
}

export { AudioPlayer }