import { useEffect, useRef, useState } from 'react';
import { COL } from '../../util/components';

import {
    FrequencyResponseGraph,
    FilterCurve,
    PointerTracker,
    FilterGradient,
    FilterPoint,
    CompositeCurve,
    FrequencyResponseCurve
} from 'dsssp';

import eventBus from '../../util/events';
import { useDebounce } from 'react-haiku';

export default function eq()
{
    const colors = ['#65ffa0', '#ff5252', '#e040fb', '#6200ea', '#448aff', '#ffff00', '#ff5d2a', '#ff4081', '#18ffff', 'grey'];

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

    // const gains = new Array(10).fill(0);
    const gains = [2.6, 2.6, 1.3, -0.4, -2.8, -3.5, -2.6, -0.4, 1.8, 2.6];

    startData.forEach((_, i) => startData[i].gain = gains[i]);

    const analyserRef = useRef({});
    const visualizerRef = useRef();
    const sectionRef = useRef();

    const
        [width, setWidth] = useState(500),
        [analyser, setAnalyser] = useState(),
        [bands, setBands] = useState(startData),
        [dragging, setDragging] = useState(false),
        [showEnvelope, setShowEnvelope] = useState(false),
        [magnitudes, setMagnitudes] = useState([]),
        delayedBands = useDebounce(bands);

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

        const mags = [];

        let sum = 0;

        const samples = 4;

        for (let i = 0; i < freqArray.length; i++)
        {
            sum += freqArray[i] / 255;

            if (Math.round(i % samples) === 0)
            {
                mags.push(sum);
                sum = 0;
            }
        }

        setMagnitudes(mags.map((x, i) => { return { frequency: i * 20000 / mags.length, magnitude: x * 2 } }));

        ctx.stroke();
    }

    useEffect(() =>
    {
        if (analyser === undefined) return;

        analyserRef.current.analyser = analyser;

        const freqArray = new Uint8Array(analyserRef.current?.analyser?.frequencyBinCount);

        const int = setInterval(() =>
        {
            analyserRef.current?.analyser?.getByteFrequencyData(freqArray);

            const mags = [];

            let sum = 0;

            const samples = 4;

            for (let i = 0; i < freqArray.length; i++)
            {
                sum += freqArray[i] / 255;

                if (Math.round(i % samples) === 0)
                {
                    mags.push(sum);
                    sum = 0;
                }
            }

            setMagnitudes(mags.map((x, i) => { return { frequency: i * 20000 / mags.length, magnitude: x * 2 } }));
        });

        // draw();

        return () => { clearInterval(int); }

    }, [analyser]);

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

    useEffect(() =>
    {
        eventBus.addEventListener('ot-eqReset', () =>
        {
            setShowEnvelope(x => !x);

            setBands((oldBands) =>
            {
                const newBands = [...oldBands];

                newBands.forEach((_, i) => newBands[i].gain = gains[i]);

                return newBands;
            });
        });

        eventBus.addEventListener('ot-navChange', ({detail}) =>
        {
            if (detail !== 4) return;

            setWidth(Math.round(sectionRef.current.getBoundingClientRect().width - 100));
        });

        eventBus.addEventListener('ot-AnalyzerNode', ({detail}) => setAnalyser(detail));
    }, []);

        return (
            <COL ref={sectionRef} className='section' id='eq'>
                <canvas ref={visualizerRef} className='visualizer'/>
                <FrequencyResponseGraph
                    width={width}   
                    style={{ borderRadius: '5px' }}
                    height={250}
                    scale={{ minGain: -8, maxGain: 8, dbSteps: 2 }}
                    theme={{ background:
                        {
                            gradient: { start: 'var(--dark20)', stop: 'var(--dark15)' },
                            grid:  { lineColor: 'var(--dark30)' },
                            label: { color: 'var(--dark80)' }
                        }}}>
                    {
                        showEnvelope ?
                        (<CompositeCurve filters={bands} animate={true} color='var(--accent)'/>) :
                        (bands.map((x, i) => <FilterCurve key={i} index={i} gradientId={i} filter={x} color={colors[i]} lineWidth={2.5} opacity={.75} animate={true}/>))
                    }
                    { bands.map((x, i) => <FilterGradient key={i} id={i} filter={x} color={colors[i]}/>) }
                    { bands.map((x, i) => <FilterPoint key={i} index={i} filter={x} color={colors[i]} radius={7} dragX={false} onChange={updateCurve} onDrag={setDragging} style={dragging ? null : {transition: 'cy 300ms ease-in-out'}}/>) }
                    <PointerTracker labelColor='var(--dark80)' backgroundColor='var(--dark30)'/>
                </FrequencyResponseGraph>
                <FrequencyResponseGraph width={width} height={250} scale={{minGain: 0, maxGain: 10}}>
                    <FrequencyResponseCurve magnitudes={magnitudes}/>
                </FrequencyResponseGraph>
            </COL>
        )
    }