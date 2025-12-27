import { useEffect, useState } from 'react';
import { COL, ROW, Slider, Hover3D, AudioPlayer } from '../util/components';

import { parseTime } from '../util/functions';

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
    const [progress, setProgress] = useState(0);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volume, setVolume] = useState(100);
    const [playState, setPlayState] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    const [nowPlaying, setNowPlaying] = useState();
    const [dragging, setDragging] = useState(false);

    function clickDisplayRight({clientX, clientY})
    {
        const volumeSlider = document.querySelector('.volumeSlider');

        if (volumeSlider !== null)
        {
            const { top, bottom, left, right } = volumeSlider.getBoundingClientRect();

            if (clientX > right || clientX < left || clientY > bottom || clientY < top) setShowVolumeSlider(false);
        }
    }

    function CurrentTime()
    {
        const { minutes, seconds } = parseTime(currentTime);

        return <span>{String(minutes || 0).padStart(2, '0')}:{String(seconds || 0).padStart(2, '0')}</span>
    }
 
    function TotalTime()
    {
        const { minutes, seconds } = parseTime(nowPlaying?.duration);

        return <span>{String(minutes || 0).padStart(2, '0')}:{String(seconds || 0).padStart(2, '0')}</span>
    }

    useEffect(() =>
    {
        setProgress(100 * currentTime / nowPlaying?.duration);

        if (currentTime.toFixed(2) === nowPlaying?.duration?.toFixed(2))
        {
            // next

            // else
            setPlayState(false);
        }

    }, [currentTime, nowPlaying]);

    useEffect(() =>
    {
        window.ipc.invoke('ipc-nowPlaying').then(x => setNowPlaying(x));
    }, []);

    return (
        <COL id='displayRight' onClick={clickDisplayRight}>
            <AudioPlayer file={nowPlaying?.file} setCurrentTime={setCurrentTime} progress={[progress, dragging]} playing={playState} audioLevel={volume}/>
            <ROW className='albumartWrapper'>
                <Hover3D style={{display: 'flex'}}>
                    <img className='albumart' src={nowPlaying?.image} draggable={false}/>
                </Hover3D>
            </ROW>
            <COL className='info'>
                <span className='overflowPrevent'>{nowPlaying?.title}</span>
                <span className='small overflowPrevent'>{nowPlaying?.artist}</span>
                <span className='small overflowPrevent'>{nowPlaying?.album}</span>
            </COL>
            <ROW className='miscButtons'>
                <button><CloseRounded/></button>
                <button><CloseRounded/></button>
                <button><CloseRounded/></button>
                <button><CloseRounded/></button>
            </ROW>
            <ROW className='timeline'>
                <CurrentTime/>
                <Slider progressState={[progress, setProgress]} setDragging={setDragging}/>
                <TotalTime/>
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
                            <Slider progressState={[volume, setVolume]}/>
                            <span>{Math.round(volume)}</span>
                        </ROW>
                    ) : null
                }
            </ROW>
        </COL>
    )
}