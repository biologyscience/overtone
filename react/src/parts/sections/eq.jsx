import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-haiku';

import {
    FrequencyResponseGraph,
    FilterCurve,
    PointerTracker,
    FilterGradient,
    FilterPoint,
    CompositeCurve,
    FrequencyResponseCurve
} from 'dsssp';

import
{
    AddRounded,
    SaveRounded
} from '@mui/icons-material';

import { COL, ROW, CustomDropdown } from '../../util/components';
import eventBus from '../../util/events';

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
    const sectionRef = useRef();

    const
        [width, setWidth] = useState(500),
        [analyser, setAnalyser] = useState(),
        [magnitudes, setMagnitudes] = useState([]),
        [bands, setBands] = useState(startData),
        [dragging, setDragging] = useState(false),
        [showEnvelope, setShowEnvelope] = useState(false),
        [enableEQ, setEnableEQ] = useState(true),
        [EQs, setEQs] = useState({}),
        [presets, setPresets] = useState([]),
        [selectedPreset, setSelectedPreset] = useState('Flat'),
        delayedBands = useDebounce(bands);

    function updateCurve({index, freq, gain, q, type})
    {
        setBands((oldBands) =>
        {
            const newBands = [...oldBands];

            newBands[index] = { freq, gain, q, type };

            return newBands;
        });
    }

    function setGain(index, gain)
    {
        const float = parseFloat(gain);

        if (isNaN(float)) return;

        setBands((oldBands) =>
        {
            const newBands = [...oldBands];

            newBands[index].gain = parseFloat(float.toFixed(1));

            return newBands;
        });
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

            setMagnitudes(mags.map((x, i) => { return { frequency: i * 20000 / mags.length, magnitude: x / samples } }));
        });

        return () => { clearInterval(int); }

    }, [analyser]);

    useEffect(() =>
    {
        const gains = delayedBands.map(x => x.gain);

        eventBus.dispatchEvent(new CustomEvent('ot-eqChange', {detail: gains}));

    }, [delayedBands]);

    useEffect(() =>
    {
        EQs[selectedPreset]?.forEach((gain, index) => setGain(index, gain));

    }, [selectedPreset, EQs]);

    useEffect(() =>
    {
        eventBus.addEventListener('ot-navChange', ({detail}) =>
        {
            if (detail !== 4) return;

            setWidth(Math.round(sectionRef.current.querySelector('.content').getBoundingClientRect().width));
        });

        eventBus.addEventListener('ot-AnalyzerNode', ({detail}) => setAnalyser(detail));

        window.ipc.on('ipc-takeEQs', (eqs) => { setEQs(eqs); setPresets(Object.keys(eqs)); });

        window.ipc.send('ipc-wantEQs');
    }, []);

    return (
        <COL ref={sectionRef} className='section' id='eq'>
            <span className='title'>Equalizer & Visualization</span>
            <COL className={'content'}>
                <COL className={`graphs ${enableEQ ? null : 'disableEQ'}`}>
                    <FrequencyResponseGraph
                        className='visualizer'
                        width={width}
                        height={100}
                        scale={{ minGain: 0, maxGain: 1 }}
                        style={{ borderRadius: '5px' }}
                        theme={{ background:
                            {
                                gradient: { start: 'var(--dark20)', stop: 'var(--dark15)' },
                                grid:  { lineColor: 'var(--dark30)' },
                                label: { color: 'var(--dark80)' }
                            }
                        }}
                    >
                        <FrequencyResponseCurve magnitudes={magnitudes} color='var(--accent)'/>
                    </FrequencyResponseGraph>
                    <FrequencyResponseGraph
                        width={width}
                        height={250}
                        style={{ borderRadius: '5px' }}
                        scale={{ minGain: -8, maxGain: 8, dbSteps: 2 }}
                        theme={{ background:
                            {
                                gradient: { start: 'var(--dark20)', stop: 'var(--dark15)' },
                                grid:  { lineColor: 'var(--dark30)' },
                                label: { color: 'var(--dark80)' }
                            }
                        }}
                    >
                        {
                            showEnvelope ?
                            (<CompositeCurve filters={bands} animate={true} color='var(--accent)'/>) :
                            (bands?.map((x, i) => <FilterCurve key={i} gradientId={`curve${i}`} filter={x} color={colors[i]} lineWidth={2.5} opacity={.75} animate={true}/>))
                        }
                        { bands?.map((x, i) => <FilterGradient key={i} id={`curve${i}`} filter={x} color={colors[i]}/>) }
                        { bands?.map((x, i) => <FilterPoint key={i} index={i} filter={x} color={colors[i]} radius={7} dragX={false} wheelQ={false} onChange={updateCurve} onDrag={setDragging} style={dragging ? null : {transition: 'cy 300ms ease-in-out'}}/>) }
                        <PointerTracker labelColor='var(--dark80)' backgroundColor='var(--dark30)'/>
                    </FrequencyResponseGraph>
                </COL>
                <COL className={'options'}>
                    <ROW className={'head'}>
                        <ROW>
                            <span>Enable Equalizer</span>
                            <input type='checkbox' className='switch' checked={enableEQ} onChange={() => setEnableEQ(x => !x)}/>
                        </ROW>
                        <ROW>
                            <span>Envelope View</span>
                            <input type='checkbox' className='switch' checked={showEnvelope} onChange={() => setShowEnvelope(x => !x)}/>
                        </ROW>
                    </ROW>
                    <ROW className={'bands'}>
                        {
                            startData.map((x, i) =>
                            {
                                return (
                                    <COL className={`band ${enableEQ ? null : 'disableEQ'}`}>
                                        <input value={bands[i].gain.toFixed(1)} onChange={({target}) => setGain(i, target.value)}/>
                                        <span>{Intl.NumberFormat('en-us', {maximumFractionDigits: 3, notation: 'compact'}).format(x.freq).toLowerCase()}Hz</span>
                                    </COL>
                                )
                            })
                        }
                    </ROW>
                    <ROW className={`presets ${enableEQ ? null : 'disableEQ'}`}>
                        <CustomDropdown className={'eqPreset'} options={presets} select={[selectedPreset, setSelectedPreset]}/>
                        <button><AddRounded/></button>
                        <button><SaveRounded/></button>
                    </ROW>
                </COL>
            </COL>
        </COL>
    )
}