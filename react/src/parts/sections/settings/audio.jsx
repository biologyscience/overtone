import { useState } from 'react';

import { COL, ROW, Slider, CustomDropdown } from '../../../util/components';

export default function Audio()
{
    const
        [select, setSelect] = useState(),
        [slider, setSlider] = useState();

    return (
        <COL className={'view'}>
            <ROW className={'option'}>
                <span>Audio device</span>
                <CustomDropdown
                    options={['Device 1', 'Device 2', 'Device 3']}
                    defaultOptionIndex={0}
                    select={[select, setSelect]}
                />
            </ROW>
            <ROW className={'option'}>
                <span>Playback speed</span>
                <ROW className={'sliderInOption'}>
                    <Slider progressState={[slider, setSlider]}/>
                    <span>{(slider * 2 / 100).toFixed(2)}</span>
                </ROW>
            </ROW>
            <ROW className={'option'}>
                <span>Pitch Modifier</span>
                <ROW className={'sliderInOption'}>
                    <Slider progressState={[slider, setSlider]}/>
                    <span>{(slider * 2 / 100).toFixed(2)}</span>
                </ROW>
            </ROW>
            <ROW className={'option'}>
                <span>Pause palyback when other media starts playing</span>
                <input type='checkbox' className='switch'/>
            </ROW>
            <ROW className={'option'}>
                <span>Fade in/out volume when playing/paused</span>
                <ROW className={'sliderInOption'}>
                    <Slider progressState={[slider, setSlider]}/>
                    <span>{(slider * 2 / 100).toFixed(2)}</span>
                </ROW>
            </ROW>
            <ROW className={'option'}>
                <span>Pause/Resume when audio is muted/unmuted</span>
                <input type='checkbox' className='switch'/>
            </ROW>
            <ROW className={'option'}>
                <span>Pause when audio device is disconnected</span>
                <input type='checkbox' className='switch'/>
            </ROW>
        </COL>
    )
}