import { useEffect, useRef } from 'react';

function AudioPlayer({file, setCurrentTime, progress: [progressPercent, force], playing, audioLevel})
{
    const player = useRef();
    const preGainRef = useRef();
    const filtersRef = useRef();

    useEffect(() =>
    {
        if (!force) return;
        
        player.current.currentTime = (progressPercent || 0) * (player.current.duration || 0) / 100;

    }, [progressPercent, force]);

    useEffect(() =>
    {
        player.current.pause();
        player.current.src = file;

        setCurrentTime(0);

    }, [file]);

    useEffect(() =>
    {
        if (file === undefined) return;

        if (playing) player.current.play();
        else player.current.pause();

    }, [file, playing]);


    useEffect(() => { player.current.volume = audioLevel / 100; }, [audioLevel]);

    useEffect(() =>
    {
        const audioPlayer = player.current;

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

            let node = source;

            [preGainRef.current, ...filters, ctx.destination].forEach((filter) =>
            {
                node.connect(filter);
                node = filter;
            });

            node.connect(ctx.destination);
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

        window.addEventListener('ot-eq0', () => eqChange(0));
        window.addEventListener('ot-eq1', () => eqChange(1));

        audioPlayer.addEventListener('play', init);
        audioPlayer.addEventListener('ended', () => setCurrentTime(audioPlayer.duration));
        audioPlayer.addEventListener('timeupdate', updateTime);
        
        return () =>
        {
            audioPlayer.removeEventListener('play', init);
            audioPlayer.removeEventListener('ended', () => setCurrentTime(audioPlayer.duration));
            audioPlayer.removeEventListener('timeupdate', updateTime);
        }
    }, []);

    return <audio ref={player}/>
}

export { AudioPlayer }