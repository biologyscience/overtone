import { useState } from 'react';
import { COL, ROW, Slider, Hover3D } from '../util/components';

import
{
    VolumeUpRounded,
    VolumeDownRounded,
    VolumeMuteRounded,
    SkipPreviousRounded,
    PauseRounded,
    PlayArrowRounded,
    SkipNextRounded,
    CloseRounded
} from '@mui/icons-material';

export default function displayRight()
{
    const [progress, setProgress] = useState(50);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volume, setVolume] = useState(40);
    const [playState, setPlayState] = useState(false);

    function clickDisplayRight({clientX, clientY})
    {
        const volumeSlider = document.querySelector('.volumeSlider');

        if (volumeSlider !== null)
        {
            const { top, bottom, left, right } = volumeSlider.getBoundingClientRect();

            if (clientX > right || clientX < left || clientY > bottom || clientY < top) setShowVolumeSlider(false);
        }
    }

    return (
        <COL id='displayRight' onClick={clickDisplayRight}>
            <ROW className='albumartWrapper'>
                <Hover3D style={{display: 'flex'}}>
                    <img className='albumart' src='https://unsplash.it/1000' draggable={false}/>
                </Hover3D>
            </ROW>
            <COL className='info'>
                <span className='overflowPrevent'>Song Name</span>
                <span className='small overflowPrevent'>Artist Name</span>
                <span className='small overflowPrevent'>Album Name</span>
            </COL>
            <ROW className='miscButtons'>
                <button><CloseRounded/></button>
                <button><CloseRounded/></button>
                <button><CloseRounded/></button>
                <button><CloseRounded/></button>
            </ROW>
            <ROW className='timeline'>
                <span>00:00</span>
                <Slider progress={progress} setProgress={setProgress}/>
                <span>59:59</span>
            </ROW>
            <ROW className='mediaButtons'>
                <button onClick={() => setShowVolumeSlider(x => !x)} className={showVolumeSlider ? 'current' : ''}>
                    { Math.round(volume) > 0 ? volume > 50 ? <VolumeUpRounded/> : <VolumeDownRounded/> : <VolumeMuteRounded/> }
                </button>
                <button><SkipPreviousRounded/></button>
                <button onClick={() => setPlayState(x => !x)}>
                    { playState ? <PauseRounded/> : <PlayArrowRounded/> }
                </button>
                <button><SkipNextRounded/></button>
                <button><CloseRounded/></button>
                {
                    showVolumeSlider ? (
                        <ROW className='volumeSlider'>
                            <Slider progress={volume} setProgress={setVolume}/>
                            <span>{Math.round(volume)}</span>
                        </ROW>
                    ) : null
                }
            </ROW>
        </COL>
    )
}