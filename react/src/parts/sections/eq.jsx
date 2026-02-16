import { useEffect, useRef, useState } from 'react';
import { COL } from '../../util/components';

import {
    FrequencyResponseGraph,
    FilterCurve,
    PointerTracker,
    FilterGradient,
    FilterPoint,
    CompositeCurve
} from 'dsssp';

import eventBus from '../../util/events';
import { useDebounce } from 'react-haiku';

export default function eq()
{
    const [analyser, setAnalyser] = useState();

    const startData = [
        { freq: 32, gain: 2, q: 1, type: 'PEAK' },
        { freq: 64, gain: 2, q: 1, type: 'PEAK' },
        { freq: 125, gain: 2, q: 1, type: 'PEAK' },
        { freq: 250, gain: 2, q: 1, type: 'PEAK' },
        { freq: 500, gain: 2, q: 1, type: 'PEAK' },
        { freq: 1000, gain: 2, q: 1, type: 'PEAK' },
        { freq: 2000, gain: 2, q: 1, type: 'PEAK' },
        { freq: 4000, gain: 2, q: 1, type: 'PEAK' },
        { freq: 8000, gain: 2, q: 1, type: 'PEAK' },
        { freq: 16000, gain: 2, q: 1, type: 'PEAK' },
    ];

    const gains = new Array(10).fill(0);
    // const gains = [2.6, 2.6, 1.3, -0.4, -2.8, -3.5, -2.6, -0.4, 1.8, 2.6];

    startData.forEach((_, i) => startData[i].gain = gains[i]);

    const [realTimeBand, setRealTimeBand] = useState(startData);

    const analyserRef = useRef({});
    const visualizerRef = useRef();
    const playerRef = useRef();

    function draw()
    {
        requestAnimationFrame(draw);

        const freqArray = new Uint8Array(analyserRef.current.analyser.frequencyBinCount);

        analyserRef.current.analyser.getByteFrequencyData(freqArray);

        const ctx = visualizerRef.current.getContext('2d');

        ctx.clearRect(0, 0, visualizerRef.current.width, visualizerRef.current.height);

        const color = document.querySelector(':root').style.getPropertyValue('--accent');

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();

        const logScale = freqArray.filter((value, i) =>
        {
            const freq = i * 20000 / freqArray.length;

            if (freq > 1000 && freq < 10000 && freq % 100 > 10) return false;
            if (freq > 10000 && freq % 1000 > 100) return false;

            return true;
        });

        for (let i = 0; i < logScale.length; i++)
        {
            const
                x = i * 2,
                y = visualizerRef.current.height,
                w = 1,
                h = -(logScale[i] / 255) * visualizerRef.current.height;

            ctx.fillRect(x, y, w, h);

            // const minF = 20;
            // const maxF = 20000;
            // const freq = i * maxF / freqArray.length;

            // const x = Math.log10(freq / minF) / Math.log10(maxF / minF) * visualizerRef.current.width;
            // const y = visualizerRef.current.height - (freqArray[i] / 255) * visualizerRef.current.height;

            // if (i === 0) ctx.moveTo(x, y);
            // else ctx.lineTo(x, y);
        }

        ctx.stroke();
    }

    useEffect(() =>
    {
        if (analyser === undefined) return;

        analyserRef.current.analyser = analyser;

        draw();

    }, [analyser]);

    const [bands, setBands] = useState(startData);
    const delayedBands = useDebounce(bands);

    function updateCurve({index, freq, gain, q, type})
    {
        setBands((oldBands) =>
        {
            const newBands = [...oldBands];

            newBands[index] = { freq, gain, q, type };

            return newBands;
        });
    }

    useEffect(() =>
    {
        const gains = delayedBands.map(x => x.gain);

        eventBus.dispatchEvent(new CustomEvent('ot-eqChange', {detail: gains}));
    }, [delayedBands]);

    const colors = ['#65ffa0', '#ff5252', '#e040fb', '#6200ea', '#448aff', '#ffff00', '#ff5d2a', '#ff4081', '#18ffff', 'white'];

    useEffect(() =>
    {
        eventBus.addEventListener('ot-eqReset', () =>
        {
            setBands((oldBands) =>
            {
                const newBands = [...oldBands];

                newBands.forEach((_, i) => newBands[i].gain = gains[i]);

                return newBands;
            });
        });

        eventBus.addEventListener('ot-AnalyzerNode', ({detail}) => setAnalyser(detail));
    }, []);

    return (
        <COL className='section' id='eq'>
            <canvas ref={visualizerRef} className='visualizer'/>
            <FrequencyResponseGraph width={800} height={250} scale={{minGain: -8, maxGain: 8, dbSteps: 2}}>
                { bands.map((x, i) => <FilterCurve key={i} index={i} gradientId={i} filter={x} color={colors[i]} lineWidth={2.5} opacity={.75}/>) }
                { bands.map((x, i) => <FilterGradient key={i} id={i} filter={x} color={colors[i]}/>) }
                { bands.map((x, i) => <FilterPoint key={i} index={i} filter={x} color={colors[i]} radius={7} dragX={false} onChange={updateCurve}/>) }
                <CompositeCurve filters={bands}/>
                <PointerTracker/>
            </FrequencyResponseGraph>
            {/* <FrequencyResponseGraph width={800} height={250} scale={{minGain: -15, maxGain: 15, dbSteps: 3}}>
                <CompositeCurve filters={realTimeBand}/>
            </FrequencyResponseGraph> */}
        </COL>
    )
}