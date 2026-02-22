import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-haiku';
import toast, { Toaster } from 'react-hot-toast';

import {
    FrequencyResponseGraph,
    FilterCurve,
    PointerTracker,
    FilterGradient,
    FilterPoint,
    CompositeCurve,
    FrequencyResponseCurve
} from 'dsssp';

import { AddRounded, SaveRounded } from '@mui/icons-material';

import { COL, ROW, CustomDropdown, CustomModal } from '../../util/components';
import eventBus from '../../util/events';

export default function eqs()
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

    const analyserRef = useRef({});
    const sectionRef = useRef();

    const
        [width, setWidth] = useState(500),
        [analyser, setAnalyser] = useState(),
        [enableVisualization, setEnableVisualization] = useState(),
        [timeFrequency, setTimeFrequency] = useState(),
        [magnitudes, setMagnitudes] = useState([]),
        [bands, setBands] = useState(startData),
        [dragging, setDragging] = useState(false),
        [showEnvelope, setShowEnvelope] = useState(false),
        [enableEQ, setEnableEQ] = useState(),
        [EQs, setEQs] = useState({}),
        [presets, setPresets] = useState([]),
        [selectedPreset, setSelectedPreset] = useState(),
        [showSavePresetModal, setShowSavePresetModal] = useState(false),
        [savePresetName, setSavePresetName] = useState(),
        delayedBands = useDebounce(bands);

    function updateCurve({index, freq, gain, q, type})
    {
        setSelectedPreset('Custom');

        setBands((oldBands) =>
        {
            const newBands = [...oldBands];

            newBands[index] = { freq, gain, q, type };

            return newBands;
        });
    }

    function setGain(index, gain, manual)
    {
        if (manual) setSelectedPreset('Custom');

        const float = parseFloat(gain);

        if (isNaN(float)) return;

        setBands((oldBands) =>
        {
            const newBands = [...oldBands];

            newBands[index].gain = parseFloat(float.toFixed(1));

            return newBands;
        });
    }

    function saveOrNewPreset(save, name, gains)
    {
        if (save)
        {
            if (name?.toLowerCase() === 'custom') return toast.error('Preset cannot be named "Custom"', {toasterId: 'eqs'});

            if (gains)
            {
                window.ipc.send('ipc-savePreset', {name, gains});

                setSelectedPreset(name);
                setShowSavePresetModal(false);

                toast.success(`Successfully saved the preset "${name}"`, {toasterId: 'eqs'});
            }

            else setShowSavePresetModal(true);
        }

        else setSelectedPreset('Custom');
    }

    useEffect(() =>
    {
        window.ipc.send('ipc-updateConfig', ({value: enableVisualization, keys: ['eq', 'show']}));
        window.ipc.send('ipc-updateConfig', ({value: timeFrequency, keys: ['eq', 'timeDomain']}));

        if (analyser === undefined) return;

        analyserRef.current.analyser = analyser;

        const timeArray = new Float32Array(analyserRef.current?.analyser?.frequencyBinCount);
        const freqArray = new Uint8Array(analyserRef.current?.analyser?.frequencyBinCount);

        let int, mags, sum, samples, list;

        if (!enableVisualization) return;

        int = setInterval(() =>
        {
            analyserRef.current.analyser.getFloatTimeDomainData(timeArray);
            analyserRef.current.analyser.getByteFrequencyData(freqArray);

            mags = []; sum = 0;

            if (timeFrequency)
            {
                samples = 1;
                list = [...timeArray].map(x => (x + 1) / 2);
            }
            
            else
            {
                samples = 4;
                list = [...freqArray].map(x => x / 255);
            }

            for (let i = 0; i < list.length; i++)
            {
                sum += list[i] / samples;

                if (Math.round(i % samples) === 0)
                {
                    mags.push(sum);
                    sum = 0;
                }
            }

            setMagnitudes(mags.map((x, i) => { return { frequency: i * 20000 / mags.length, magnitude: x } }));
            
        }, timeFrequency ? 35 : 15);

        return () => { clearInterval(int); }

    }, [analyser, timeFrequency, enableVisualization]);

    useEffect(() => 
    {
        if (!enableEQ) return;

        const gains = delayedBands.map(x => x.gain);

        eventBus.dispatchEvent(new CustomEvent('ot-eqChange', {detail: gains}));

    }, [delayedBands]);

    useEffect(() =>
    {
        window.ipc.send('ipc-updateConfig', {value: enableEQ, keys: ['eq', 'enabled']});

        if (enableEQ) eventBus.dispatchEvent(new CustomEvent('ot-eqChange', {detail: bands.map(x => x.gain)}));
        else eventBus.dispatchEvent(new CustomEvent('ot-eqChange', {detail: Array(10).fill(0)}));

    }, [enableEQ]);

    useEffect(() =>
    {
        if (selectedPreset === 'Custom') return;
    
        EQs[selectedPreset]?.forEach((gain, index) => setGain(index, gain));
        
        window.ipc.send('ipc-updateConfig', {value: selectedPreset, keys: ['eq', 'preset']});

    }, [selectedPreset, EQs]);

    useEffect(() =>
    {
        eventBus.addEventListener('ot-navChange', () => setWidth(Math.round(sectionRef.current.querySelector('.content').getBoundingClientRect().width)));
        eventBus.addEventListener('ot-AnalyzerNode', ({detail}) => setAnalyser(detail));

        window.ipc.on('ipc-takeConfig', ({eq}) => { setEnableEQ(eq.enabled); setSelectedPreset(eq.preset); setTimeFrequency(eq.timeDomain); setEnableVisualization(eq.show); });
        window.ipc.on('ipc-takeEQs', (eqs) => { setEQs(eqs); setPresets(Object.keys(eqs).sort((x, y) => x.localeCompare(y))); });

        window.ipc.send('ipc-wantEQs');
    }, []);

    return (
        <COL ref={sectionRef} className='section' id='eqs'>
            <span className='title'>Equalizer & Visualization</span>
            <COL className={'content'}>
                <ROW className={'head'}>
                    <ROW className={'option'}>
                        <span>Enable Visualization</span>
                        <input type='checkbox' className='switch' checked={enableVisualization} onChange={() => setEnableVisualization(x => !x)}/>
                    </ROW>
                    <ROW className={'option'}>
                        <span>Frequency Domain</span>
                        <input type='checkbox' className='switch' checked={timeFrequency} onChange={() => setTimeFrequency(x => !x)}/>
                        <span>Time Domain</span>
                    </ROW>
                </ROW>
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
                        <ROW className={'option'}>
                            <span>Enable Equalizer</span>
                            <input type='checkbox' className='switch' checked={enableEQ} onChange={() => setEnableEQ(x => !x)}/>
                        </ROW>
                        <ROW className={`presets ${enableEQ ? null : 'disableEQ'}`}>
                            <CustomDropdown className={'eqPreset'} options={presets} select={[selectedPreset, setSelectedPreset]}/>
                            <button onClick={() => saveOrNewPreset(selectedPreset === 'Custom')}>{selectedPreset === 'Custom' ? <SaveRounded/> : <AddRounded/>}</button>
                        </ROW>
                        <ROW className={'option'}>
                            <span>Envelope View</span>
                            <input type='checkbox' className='switch' checked={showEnvelope} onChange={() => setShowEnvelope(x => !x)}/>
                        </ROW>
                    </ROW>
                    <ROW className={'bands'}>
                        {
                            startData.map((x, i) =>
                            {
                                return (
                                    <COL key={i} className={`band ${enableEQ ? null : 'disableEQ'}`}>
                                        <input value={bands[i].gain.toFixed(1)} onChange={({target}) => setGain(i, target.value)} onWheel={({deltaY}) => setGain(i, bands[i].gain + (deltaY >= 1 ? -0.1 : 0.1), true)}/>
                                        <span>{Intl.NumberFormat('en-us', {maximumFractionDigits: 3, notation: 'compact'}).format(x.freq).toLowerCase()}Hz</span>
                                    </COL>
                                )
                            })
                        }
                    </ROW>
                </COL>
            </COL>
            <CustomModal parentRef={sectionRef} visibility={[showSavePresetModal, setShowSavePresetModal]}>
                <COL className={'savePresetModal'}>
                    <span className='title'>You are about to save the current EQ as a preset</span>
                    <span>Name your preset to proceed</span>
                    <input placeholder='Your preset name' value={savePresetName} onChange={({target}) => setSavePresetName(target.value)}/>
                    <ROW className={'buttons'}>
                        <button onClick={() => saveOrNewPreset(true, savePresetName, bands.map(x => x.gain))}>Save</button>
                        <button onClick={() => setShowSavePresetModal(false)}>Cancel</button>
                    </ROW>
                </COL>
            </CustomModal>
            <Toaster
                toasterId='eqs'
                position='bottom-right'
                containerStyle={{
                    position: 'absolute',
                    fontSize: '.8rem'
                }}
            />
        </COL>
    )
}