import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import { CloseRounded, InfoOutlineRounded, FavoriteBorderRounded, FavoriteRounded } from '@mui/icons-material';

import { parseTime } from './functions';
import eventBus from './events';

function ROW({ className, children, ...rest })
{
    return (
        <div className={className === undefined ? 'flexROW' : `flexROW ${className}`} {...rest}>
            {children}
        </div>
    )
}

function COL({ className, children, ...rest })
{
    return (
        <div className={className === undefined ? 'flexCOL' : `flexCOL ${className}`} {...rest}>
            {children}
        </div>
    )
}

function GRID({ className, children, ...rest })
{
    return (
        <div className={className === undefined ? 'grid' : `grid ${className}`} {...rest}>
            {children}
        </div>
    )
}

function Slider({ progressState: [progress, setProgress], setDragging, vertical, className, children, ...rest })
{
    let classtext = 'sliderWrapper';

    if (vertical) classtext += ' vertical';
    if (className !== undefined) classtext += ` ${className}`;

    const parentRef = useRef();
    const pressing = useRef(false);

    function mouseup()
    {
        pressing.current = false;

        if (setDragging !== undefined) setDragging(pressing.current);

        // change audio current time here
    }
    
    function mousemove({x, y})
    {
        if (pressing.current === false) return mouseup();

        const { top, bottom, left, right, width } = parentRef.current.getBoundingClientRect();

        if (x > right || x < left || y > bottom || y < top) return mouseup();

        const percent = 100 * (x - left) / width;

        setProgress(percent);
    }

    function mousedown(E)
    {
        pressing.current = true;

        if (setDragging !== undefined) setDragging(pressing.current);

        mousemove(E);
    }

    useEffect(() =>
    {
        parentRef.current.addEventListener('mousedown', mousedown);
        document.body.addEventListener('mousemove', mousemove);
        parentRef.current.addEventListener('mouseup', mouseup);
    }, []);

    return (
        <div ref={parentRef} className={classtext}>
            <div style={{'--progress': `${progress}%`}} className='slider' {...rest}>
                {children}
            </div>
        </div>
    )
}

function Hover3D({ className, children, ...rest })
{
    const parentRef = useRef();

    function slight() { parentRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; }
    function zoom() { parentRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; }

    function move({clientX, clientY})
    {
        const { top, bottom, left, right } = parentRef.current.getBoundingClientRect();

        const
            extent = 7,
            midx = (bottom - top) / 2,
            midY = (right - left) / 2,
            rotationX = extent * (midY - (clientY - top)) / midY,
            rotationY = -extent * (midx - (clientX - left)) / midx;

        parentRef.current.style.transform = `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

    return (
        <div ref={parentRef} className={className === undefined ? 'hover3D' : `hover3D ${className}`} {...rest}
            onMouseOut={slight} onMouseDown={slight} onMouseUp={zoom} onMouseMove={move}>
            {children}
        </div>
    )
}

function SearchBox({searchSpace, matchSpace, ...rest})
{
    if (searchSpace === undefined) return;

    const [noMatch, setNoMatch] = useState(false);
    
    const searchSpaceValues = [...searchSpace].map(x => new String(x).toLowerCase());
    const [mathSpaceValues, setMatchSpaceValues] = matchSpace;

    let
        wait = false,
        lastInput;
    
    function handleChange({target})
    {
        // if (wait) return;
    
        // wait = true;
        
        // if (lastInput === target.value.toLowerCase()) return wait = false;
    
        lastInput = target.value.toLowerCase();

        searchSpaceValues.forEach((item, index) => item.includes(lastInput) ? mathSpaceValues[index] = true : mathSpaceValues[index] = false);

        mathSpaceValues.includes(true) ? setNoMatch(false) : setNoMatch(true);

        setMatchSpaceValues([...mathSpaceValues]);

        // setTimeout(() =>
        // {
        //     wait = false;
    
        //     if (lastInput !== target.value.toLowerCase()) handleChange({target});

        // }, 1000);
    }

    return <input type='text' onChange={handleChange} data-no-match={noMatch} {...rest}/>
}

function CustomModal({visibility: [open, setOpen], parentRef, children})
{
    return (
        <Modal
            closeAfterTransition
            container={parentRef?.current}
            open={open}
            onClose={() => setOpen(false)}
            sx={{ position: 'absolute', inset: 0 }}
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 500, sx: { position: 'absolute', inset: 0, zIndex: 0 } }}}>
            <Fade in={open}>
                <div style={{
                    position: 'absolute',
                    zIndex: 1,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}>
                    {children}
                </div>
            </Fade>
        </Modal>
    );
}

function ContextMenu({visibility, title, options, parentRef})
{
    const clickables = [];

    options.forEach((section, i) =>
    {
        for (let index = 0; index < section.functions.length; index++)
        {
            clickables.push(
                <ROW key={`${i}${index}`} className={'contextItem'} onClick={section.functions[index]}>
                    {section.icons[index]}
                    <span>{section.texts[index]}</span>
                </ROW>
            );
        }

        clickables.push(<div key={i} className='divider'/>)
    });

    return (
        <CustomModal visibility={visibility} parentRef={parentRef}>
            <COL className={'contextMenu'}>
                <ROW className={'head'}>
                    <span className='title overflowPrevent' title={title}>{title}</span>
                    <button onClick={() => visibility[1](false)}><CloseRounded/></button>
                </ROW>
                <COL className={'options'}>
                    {clickables}
                </COL>
            </COL>
        </CustomModal>
    )
}

function SongInfoModal({visibility, parentRef, songInfo})
{
    const [isFavorite, setIsFavorite] = useState(false);

    const { minutes, seconds } = parseTime(songInfo?.file?.duration);

    const filepath = songInfo?.extras?.filepath;

    let folderpath;

    if (filepath)
    {
        const x = filepath.split('\\');
        if (x.length !== 1) x.pop();
    
        const y = x.join('\\').split('/');
        if (y.length !== 1) y.pop();

        folderpath = y.join('/');
    }

    const colors =
    {
        '--background': `rgb(${songInfo?.extras?.colors?.DarkMuted?.join(',')})`,
        '--accent': `rgb(${songInfo?.extras?.colors?.LightVibrant?.join(',')})`,
        '--accent2': `rgba(${songInfo?.extras?.colors?.LightVibrant?.join(',')}, .25)`
    };

    function toggleFavorite()
    {
        setIsFavorite(x => !x);

        eventBus.dispatchEvent(new CustomEvent('ot-toggleFavorite', {detail: songInfo?.extras?.filepath}));

        window.ipc.send('ipc-favoriteSong', ({filepath: songInfo?.extras?.filepath, isFavorite: !isFavorite}));
    }

    useEffect(() => setIsFavorite(songInfo?.extras?.isFavorite), [songInfo]);

    return (
        <CustomModal visibility={visibility} parentRef={parentRef}>
            <COL className={'songInfo'} style={colors}>
                <ROW className={'head relative'}>
                    <InfoOutlineRounded/>
                    <span>Song Info</span>
                    <button onClick={() => visibility[1](false)}><CloseRounded/></button>
                </ROW>
                <COL className={'body'}>
                    <ROW className={'file'}>
                        <ROW className='imgWrapper'>
                            <img src={songInfo?.tags?.picture} onClick={() => window.ipc.send('ipc-newWindow', songInfo?.tags?.picture)} draggable={false}/>
                            <button onClick={toggleFavorite}>{isFavorite ? <FavoriteRounded/> : <FavoriteBorderRounded/>}</button>
                        </ROW>
                        <COL className={'wrapper'}>
                            <COL className={'data'}>
                                <span className='type'>Filename</span>
                                <span className='value overflowPrevent' onClick={() => window.ipc.send('ipc-showFile', songInfo?.extras?.filepath)}>{songInfo?.extras?.filepath?.split('/')?.pop()?.split('\\')?.pop()}</span>
                            </COL>
                            <COL className={'data'}>
                                <span className='type'>Location</span>
                                <span className='value clickable overflowPrevent' onClick={() => window.ipc.send('ipc-showFile', songInfo?.extras?.filepath)}>{folderpath}</span>
                            </COL>
                            <COL className={'data'}>
                                <span className='type'>File Size</span>
                                <span className='value'>{(songInfo?.file?.size / (1024 ** 2)).toFixed(2)} MB</span>
                            </COL>
                        </COL>
                    </ROW>
                    <COL className={'tags'}>
                        <div className='divider'/>
                        <COL className={'data'}>
                            <span className='type'>Title</span>
                            <span className='value'>{songInfo?.tags?.title || 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Album</span>
                            <span className='value clickable' onClick={() => { visibility[1](false); eventBus.dispatchEvent(new CustomEvent('ot-showAlbum', {detail: {album: songInfo?.tags?.album, artist: songInfo?.tags?.artists[0]}})); }}>{songInfo?.tags?.album || 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Artists</span>
                            <span className='value clickable' onClick={() => { visibility[1](false); eventBus.dispatchEvent(new CustomEvent('ot-showArtist', {detail: songInfo?.tags?.artists[0]})); }}>{songInfo?.tags?.artists?.join(', ') || 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Album Artist</span>
                            <span className='value'>{songInfo?.tags?.albumartist || 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Genre</span>
                            <span className='value'>{songInfo?.tags?.genre?.join(', ') || 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Tempo</span>
                            <span className='value'>{songInfo?.tags?.bpm ? `${songInfo.tags.bpm} bpm` : 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Track Number</span>
                            <span className='value'>{songInfo?.tags?.track?.no || 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Disc Number</span>
                            <span className='value'>{songInfo?.tags?.disk?.no || 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Year</span>
                            <span className='value'>{songInfo?.tags?.year || 'Unkown'}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Label</span>
                            <span className='value'>{songInfo?.tags?.label?.join(', ') || 'Unkown'}</span>
                        </COL>
                        <div className='divider'/>
                        <COL className={'data'}>
                            <span className='type'>Duration</span>
                            <span className='value'>{String(minutes || 0).padStart(2, '0')}:{String(seconds || 0).padStart(2, '0')}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Bitrate</span>
                            <span className='value'>{Intl.NumberFormat('en-us', {maximumFractionDigits: 3, notation: 'compact'}).format(songInfo?.file?.bitrate).toLowerCase()}bps</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Sample Rate</span>
                            <span className='value'>{Intl.NumberFormat('en-us', {maximumFractionDigits: 3, notation: 'compact'}).format(songInfo?.file?.sampleRate).toLowerCase()}Hz</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Channels</span>
                            <span className='value'>{songInfo?.file?.numberOfChannels}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Format</span>
                            <span className='value'>{songInfo?.file?.container} {songInfo?.file?.losless ? '| Losless' : null}</span>
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Encoding</span>
                            <span className='value'>{songInfo?.file?.codec} | {songInfo?.file?.codecProfile}</span>
                        </COL>
                        <div className='divider'/>
                        <COL className={'data'}>
                            <span className='type'>Play Count</span>
                            <span className='value'>{songInfo?.extras?.playCount}</span>
                        </COL>
                    </COL>
                </COL>
            </COL>
        </CustomModal>
    );
}

function DeleteModal({visibility, parentRef, files, toasterId})
{
    const [hide, setHide] = useState(false);

    function performDelete()
    {
        setHide(true);

        const pendingToast = toast.loading(`Deleting selected ${files?.length > 1 ? 'files' : 'file'} ...`, {toasterId});

        window.ipc.invoke('ipc-deleteFiles', {files}).then((success) =>
        {
            if (success)
            {
                toast.success('Deleted successfully', {id: pendingToast});
                eventBus.dispatchEvent(new Event('ot-filesDeleted'));
            }

            else toast.error(`Error deleting ${files?.length > 1 ? 'files' : 'file'}`, {id: pendingToast});

            visibility[1](false);
            setTimeout(() => setHide(false), 250);
        });
    }

    return (
        <CustomModal visibility={visibility} parentRef={parentRef}>
            <COL className={`deleteModal ${hide ? 'hide' : null}`}>
                <span className='title'>Delete {files?.length > 1 ? 'files' : 'file'}</span>
                <span className='text'>Are you sure you want to permanently delete the selected {files?.length > 1 ? 'files?' : 'file?'}</span>
                <COL className={'files'}>{files?.map((x, i) => <span key={i} className='overflowPrevent'>{x}</span>)}</COL>
                <ROW className={'buttons'}>
                    <button className='yes' onClick={performDelete}>Yes</button>
                    <button onClick={() => visibility[1](false)}>No</button>
                </ROW>
            </COL>
        </CustomModal>
    )   
}

export { ROW, COL, GRID, Slider, Hover3D, SearchBox, CustomModal, ContextMenu, SongInfoModal, DeleteModal };