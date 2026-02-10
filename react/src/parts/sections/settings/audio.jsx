import { useEffect, useState } from 'react';

import { COL, ROW, Slider, CustomDropdown } from '../../../util/components';
import eventBus from '../../../util/events';
import { CancelRounded } from '@mui/icons-material';

export default function Audio()
{
    const
        [deviceLabels, setDeviceLabels] = useState([]),
        [selectedDeviceLabel, setSelectedDeviceLabel] = useState(),
        [deviceIDs, setDeviceIDs] = useState([]),
        [playbackSpeed, setPlaybackSpeed] = useState(25),
        [preservePitch, setPreservePitch] = useState(false),
        [crossfade, setCrossfade] = useState(12.5);

    async function updateDeviceList()
    {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const audioOutput = devices.filter(x => x.kind === 'audiooutput' && x.deviceId !== 'communications');

        const labels = audioOutput.map((device) =>
        {
            if (device.deviceId === 'default') return 'Default';
            return device.label;
        });

        setDeviceLabels(labels);
        setDeviceIDs(audioOutput.map(x => x.deviceId));

        setSelectedDeviceLabel((oldDevice) =>
        {
            if (oldDevice && labels.includes(oldDevice)) return oldDevice;

            else return labels[0];
        });
    }

    useEffect(() =>
    {
        const index = deviceLabels.indexOf(selectedDeviceLabel);

        if (index === -1) return;

        eventBus.dispatchEvent(new CustomEvent('ot-audioDeviceChange', ({detail: deviceIDs[index]})));

    }, [selectedDeviceLabel]);

    useEffect(() =>
    {
        eventBus.dispatchEvent(new CustomEvent('ot-changePlaybackSpeed', {detail: playbackSpeed * 4 / 100}));

    }, [playbackSpeed]);

    useEffect(() =>
    {
        eventBus.dispatchEvent(new CustomEvent('ot-preservesPitch', {detail: preservePitch}));

    }, [preservePitch]);

    useEffect(() =>
    {
        eventBus.dispatchEvent(new CustomEvent('ot-changeFadeDuration', {detail: Math.round(crossfade * 2000 / 100)}));

    }, [crossfade]);

    useEffect(() =>
    {
        updateDeviceList();
        navigator.mediaDevices.addEventListener('devicechange', updateDeviceList);
    }, []);

    return (
        <COL className={'view'}>
            <ROW className={'option'}>
                <span>Audio device</span>
                <CustomDropdown options={deviceLabels} select={[selectedDeviceLabel, setSelectedDeviceLabel]}/>
            </ROW>
            <ROW className={'option'}>
                <span>Playback speed</span>
                <ROW className={'sliderInOption'}>
                    <button className={(playbackSpeed * 4 / 100).toFixed(2) === '1.00' ? 'visibilityHidden' : null } onClick={() => setPlaybackSpeed(25)}><CancelRounded/></button>
                    <Slider progressState={[playbackSpeed, setPlaybackSpeed]}/>
                    <span>{(playbackSpeed * 4 / 100).toFixed(2)}</span>
                </ROW>
            </ROW>
            <ROW className={'option'}>
                <span>Preserve pitch across all playback speeds</span>
                <input type='checkbox' className='switch' checked={preservePitch} onChange={() => setPreservePitch(x => !x)}/>
            </ROW>
            {/* <ROW className={'option'}>
                <span>Pause palyback when other media starts playing</span>
                <input type='checkbox' className='switch'/>
            </ROW> */}
            <ROW className={'option'}>
                <span>Fade in/out volume when playing/paused</span>
                <ROW className={'sliderInOption'}>
                    <button className={Math.round(crossfade * 2000 / 100) === 250 ? 'visibilityHidden' : null } onClick={() => setCrossfade(12.5)}><CancelRounded/></button>
                    <Slider progressState={[crossfade, setCrossfade]}/>
                    <span>{ crossfade >= 49 ? `${(crossfade * 2000 / 100000).toFixed(2)} s` : `${Math.round(crossfade * 2000 / 100)} ms` }</span>
                </ROW>
            </ROW>
            {/* <ROW className={'option'}>
                <span>Pause/Resume when audio is muted/unmuted</span>
                <input type='checkbox' className='switch'/>
            </ROW>
            <ROW className={'option'}>
                <span>Pause when audio device is disconnected</span>
                <input type='checkbox' className='switch'/>
            </ROW> */}
        </COL>
    )
}