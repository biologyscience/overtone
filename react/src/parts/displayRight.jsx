import { useEffect, useRef, useState } from 'react';
import { COL, ROW, Slider, Hover3D } from '../util/components';
import { AudioPlayer } from '../util/audio';
import { parseTime } from '../util/functions';
import eventBus from '../util/events';

import
{
    VolumeUpRounded,
    VolumeDownRounded,
    VolumeMuteRounded,
    SkipPreviousRounded,
    PauseRounded,
    PlayArrowRounded,
    SkipNextRounded,
    CloseRounded,
    FavoriteBorderRounded,
    InfoOutlineRounded,
    MoreRounded
} from '@mui/icons-material';

export default function displayRight()
{
    const [progress, setProgress] = useState(0);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volume, setVolume] = useState();
    const [playState, setPlayState] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [endState, setEndState] = useState(false);

    const [nowPlaying, setNowPlaying] = useState();
    const [dragging, setDragging] = useState(false);

    const player = useRef();
    const timer = useRef({});

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

    function playNext()
    {
        window.ipc.invoke('ipc-audioPlayer-next').then((result) =>
        {
            if (result) eventBus.dispatchEvent(new Event('ot-next'));
    
            else setPlayState(false);
        });
    }

    function playPrevious()
    {
        window.ipc.send('ipc-audioPlayer-previous');

        eventBus.dispatchEvent(new Event('ot-previous'));
    }

    function timerStart()
    {
        if (timer.current.played) return;

        timer.current.lastTime = Date.now();
        timer.current.timeout = setTimeout(() => { window.ipc.send('ipc-songPlayed', timer.current.filepath); timer.current.played = true; }, (((timer.current.duration * 1000) / 2) - timer.current.timeSpent));
    }

    function timerStop()
    {
        if (timer.current.played) return;

        clearTimeout(timer.current.timeout);
        timer.current.timeSpent = Date.now() - timer.current.lastTime;
    }

    function timerReset()
    {
        clearTimeout(timer.current.timeout);
        timer.current.lastTime = Date.now();
        timer.current.timeSpent = 0;
        timer.current.played = false;
    }

    useEffect(() =>
    {
        setProgress(100 * currentTime / nowPlaying?.duration);

    }, [currentTime, nowPlaying]);

        useEffect(() =>
    {
        if (endState)
        {
            playNext();

            setEndState(false);
        }

    }, [endState]);

    useEffect(() =>
    {
        if (playState)
        {
            window.ipc.send('ipc-setRPCtime', ({time: player.current.currentTime}));

            timerStart();
        }

        else
        {
            window.ipc.send('ipc-setRPCtime', ({time: player.current.currentTime, stop: true}));

            timerStop();
        }

    }, [playState]);

    useEffect(() =>
    {
        if (showVolumeSlider || !volume) return;

        window.ipc.send('ipc-saveVolume', Math.round(volume));

    }, [showVolumeSlider]);

    useEffect(() =>
    {
        timerReset();

        window.ipc.on('ipc-setNowPlaying', (song) =>
        {
            const { title, artist, album, albumart, filepath, duration, colors } = song;

            timerReset();
            timer.current.filepath = filepath;
            timer.current.duration = duration;

            setNowPlaying(song);

            if (song.autoPlay)
            {
                timerStart();

                setPlayState(true);
            }

            navigator.mediaSession.metadata = new MediaMetadata({title, album, artist, artwork: [{src: albumart}]});

            const root = document.querySelector(':root');

            root.style.setProperty('--background', `rgb(${colors.DarkMuted.join(',')})`);
            root.style.setProperty('--accent', `rgb(${colors.LightVibrant.join(',')})`);
            root.style.setProperty('--accent2', `rgba(${colors.LightVibrant.join(',')}, .25)`);
            // document.querySelector(':root').style.setProperty('--textColor', `rgb(${colors.Vibrant.join(',')})`);
        });

        window.ipc.on('ipc-restoreVolume', setVolume);

        window.ipc.send('ipc-displayRightReady', true);

        navigator.mediaSession.setActionHandler('play', () => setPlayState(true));
        navigator.mediaSession.setActionHandler('pause', () => setPlayState(false));
        navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);

    }, []);

    return (
        <COL id='displayRight' onClick={clickDisplayRight}>
            <AudioPlayer playerRef={player} file={nowPlaying?.filepath} setCurrentTime={setCurrentTime} progress={[progress, dragging]} playing={playState} audioLevel={volume} indicateEnd={setEndState}/>
            <ROW className={`albumartWrapper ${playState ? '' : 'paused'}`}>
                <Hover3D style={{display: 'flex'}}>
                    <img className='albumart' src={nowPlaying?.albumart} draggable={false}/>
                </Hover3D>
            </ROW>
            <COL className='info'>
                <span className='overflowPrevent'>{nowPlaying?.title}</span>
                <span className='small overflowPrevent'>{nowPlaying?.artist}</span>
                <span className='small overflowPrevent'>{nowPlaying?.album}</span>
            </COL>
            <ROW className='miscButtons'>
                <button onClick={() => window.dispatchEvent(new Event('ot-eq0'))}><FavoriteBorderRounded/></button>
                <button onClick={() => window.dispatchEvent(new Event('ot-eq1'))}><InfoOutlineRounded/></button>
                <button><MoreRounded/></button>
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
                <button onClick={playPrevious}><SkipPreviousRounded/></button>
                <button onClick={() => setPlayState(x => !x)}>
                    { playState ? <PauseRounded/> : <PlayArrowRounded/> }
                </button>
                <button onClick={playNext}><SkipNextRounded/></button>
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