import { useState } from 'react';
import { OpenInNewRounded } from '@mui/icons-material';

import { COL, ROW, Slider } from '../../../util/components';

export default function Advanced()
{
    const
        [slider, setSlider] = useState();
        
    return (
        <COL className={'view'}>
            <ROW className={'option'}>
                <span>Launch OverTone on startup</span>
                <input type='checkbox' className='switch'/>
            </ROW>
            <ROW className={'option'}>
                <span>Automatically start playback on launch</span>
                <input type='checkbox' className='switch'/>
            </ROW>
            <ROW className={'option'}>
                <span>Hide app to system tray when closed</span>
                <input type='checkbox' className='switch'/>
            </ROW>
            <ROW className={'option'}>
                <span>Percentage of song duration to be considered as a play count</span>
                <ROW className={'sliderInOption'}>
                    <Slider progressState={[slider, setSlider]}/>
                    <span>{Math.round(slider)}%</span>
                </ROW>
            </ROW>
            <ROW className={'option'}>
                <span>Backup data saved by OverTone</span>
                <button className='popup'><OpenInNewRounded/></button>
            </ROW>
            <ROW className={'option'}>
                <span>Reset app</span>
                <button className='popup'><OpenInNewRounded/></button>
            </ROW>
        </COL>
    )
}