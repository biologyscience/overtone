import { useEffect, useRef, useState } from 'react';
import { COL, ROW, Slider, Hover3D, ContextMenu, SongInfoModal, DeleteModal } from '../util/components';
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
    FavoriteBorderRounded,
    FavoriteRounded,
    InfoOutlineRounded,
    PendingOutlined,
    PhotoSizeSelectSmallRounded,
    ShuffleRounded,
    ShuffleOnRounded,
    RepeatRounded,
    RepeatOnRounded,
    LyricsRounded,
    DeleteRounded,
    PlaylistAddRounded,
    DriveFileMoveRounded,
    EditRounded,
    PauseCircleOutlineRounded
} from '@mui/icons-material';

export default function displayRight()
{
    const [progress, setProgress] = useState(0);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volume, setVolume] = useState();
    const [playState, setPlayState] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [endState, setEndState] = useState(false);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [songInfoModal, setShowSongInfoModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState(false);

    const [nowPlaying, setNowPlaying] = useState({});
    const [dragging, setDragging] = useState(false);

    const player = useRef();
    const timer = useRef({});
    const sectionRef = useRef();

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

        eventBus.dispatchEvent(new CustomEvent('ot-currentTime', {detail: currentTime}));

        return <span>{String(minutes || 0).padStart(2, '0')}:{String(seconds || 0).padStart(2, '0')}</span>
    }
 
    function TotalTime()
    {
        const { minutes, seconds } = parseTime(nowPlaying?.duration);

        return <span>{String(minutes || 0).padStart(2, '0')}:{String(seconds || 0).padStart(2, '0')}</span>
    }

    function playNext({ot_auto})
    {
        window.ipc.invoke('ipc-audioPlayer-next', {ot_auto}).then((result) =>
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

    function shuffleRepeat({target})
    {
        const type = target.dataset.function;

        if (type === 'shuffle')
        {
            window.ipc.send('ipc-audioPlayer-shuffleRepeat', {shuffle: !shuffle});
            setShuffle(x => !x);
        }

        if (type === 'repeat')
        {
            window.ipc.send('ipc-audioPlayer-shuffleRepeat', {repeat: !repeat});
            setRepeat(x => !x);
        }
    }

    useEffect(() =>
    {
        setProgress(100 * currentTime / nowPlaying?.duration);

    }, [currentTime, nowPlaying]);

    useEffect(() =>
    {
        if (endState)
        {
            playNext({ot_auto: true});

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
            setIsFavorite(song.isFavorite || false);

            if (song.autoPlay)
            {
                timerStart();

                setPlayState(false);
                setTimeout(() => setPlayState(true), 10);
            }

            navigator.mediaSession.metadata = new MediaMetadata({title, album, artist, artwork: [{src: albumart}]});

            const root = document.querySelector(':root');

            root.style.setProperty('--background', `rgb(${colors.DarkMuted.join(',')})`);
            root.style.setProperty('--accent', `rgb(${colors.LightVibrant.join(',')})`);
            root.style.setProperty('--accent2', `rgba(${colors.LightVibrant.join(',')}, .25)`);
            // document.querySelector(':root').style.setProperty('--textColor', `rgb(${colors.Vibrant.join(',')})`);
        });

        window.ipc.on('ipc-restoreShuffleRepeat', (data) =>
        {
            setShuffle(data.shuffle);
            setRepeat(data.repeat);
        });
        window.ipc.on('ipc-restoreVolume', setVolume);
        window.ipc.on('ipc-restoreCurrentTime', (time) => setTimeout(() => { setCurrentTime(time); player.current.currentTime = time; }, 10));

        window.ipc.send('ipc-displayRightReady', true);

        navigator.mediaSession.setActionHandler('play', () => setPlayState(true));
        navigator.mediaSession.setActionHandler('pause', () => setPlayState(false));
        navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);

        eventBus.addEventListener('ot-toggleFavorite', ({detail: filepath}) => filepath === timer.current.filepath ? setIsFavorite(x => !x) : null);
    }, []);

    function miscButton()
    {
        
    }

    return (
        <COL ref={sectionRef} id='displayRight' className={'relative'} onClick={clickDisplayRight}>
            <AudioPlayer playerRef={player} file={nowPlaying?.filepath} setCurrentTime={setCurrentTime} progress={[progress, dragging]} playing={playState} audioLevel={volume} indicateEnd={setEndState}/>
            <ROW className={`albumartWrapper ${playState ? '' : 'paused'}`}>
                <Hover3D style={{display: 'flex'}}>
                    <img className='albumart' src={nowPlaying?.albumart} draggable={false}/>
                </Hover3D>
            </ROW>
            <COL className='info'>
                <span className='overflowPrevent'>{nowPlaying?.title}</span>
                <span className='small overflowPrevent' onClick={() => eventBus.dispatchEvent(new CustomEvent('ot-showArtist', {detail: nowPlaying?.artists?.[0]}))}>{nowPlaying?.artists?.join(', ')}</span>
                <span className='small overflowPrevent' onClick={() => eventBus.dispatchEvent(new CustomEvent('ot-showAlbum', {detail: {album: nowPlaying?.album, artist: nowPlaying?.artists?.[0]}}))}>{nowPlaying?.album}</span>
            </COL>
            <ROW className='miscButtons'>
                <button onClick={() => { window.ipc.send('ipc-favoriteSong', ({filepath: nowPlaying?.filepath, isFavorite: !isFavorite})); setIsFavorite(x => !x); }}>{isFavorite ? <FavoriteRounded/> : <FavoriteBorderRounded/>}</button>
                <button onClick={() => setShowSongInfoModal(true)}><InfoOutlineRounded/></button>
                <button onClick={() => setShowContextMenu(true)}><PendingOutlined/></button>
                <div style={{marginLeft: 'auto'}}/>
                <button data-function={'shuffle'} onClick={shuffleRepeat}>{shuffle ? <ShuffleOnRounded/> : <ShuffleRounded/>}</button>
                <button data-function={'repeat'} onClick={shuffleRepeat}>{repeat ? <RepeatOnRounded/> : <RepeatRounded/>}</button>
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
                <button onClick={miscButton}><PhotoSizeSelectSmallRounded/></button>
                {
                    showVolumeSlider ? (
                        <ROW className='volumeSlider'>
                            <Slider progressState={[volume, setVolume]}/>
                            <span>{Math.round(volume)}</span>
                        </ROW>
                    ) : null
                }
            </ROW>
            <SongInfoModal
                visibility={[songInfoModal, setShowSongInfoModal]}
                parentRef={sectionRef}
                file={nowPlaying?.filepath}
            />
            <DeleteModal
                visibility={[showDeleteModal, setShowDeleteModal]}
                parentRef={sectionRef}
                files={[nowPlaying?.filepath]}
            />
            <ContextMenu
                visibility={[showContextMenu, setShowContextMenu]}
                title={nowPlaying?.title}
                options={[
                    {
                        functions: [
                            () => {},
                            () => {},
                            () => window.ipc.send('ipc-stopAfter', nowPlaying?.filepath)
                        ],
                        icons: [<LyricsRounded/>, <PlaylistAddRounded/>, <PauseCircleOutlineRounded/>],
                        texts: ['Show Lyrics', 'Add to a queue', 'Stop after this song']
                    },
                    {
                        functions: [() => {}, () => {}],
                        icons: [<EditRounded/>, <DriveFileMoveRounded/>],
                        texts: ['Edit tags', 'Move to a folder']
                    },
                    {
                        functions: [
                            () => setShowSongInfoModal(true),
                            () => setShowDeleteModal(true)
                        ],
                        icons: [<InfoOutlineRounded/>, <DeleteRounded/>],
                        texts: ['Song info', 'Delete permanently']
                    }
                ]}
                parentRef={sectionRef}
            />
        </COL>
    )
}