import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { useClickOutside, useDebounce } from 'react-haiku';

import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import { ConfigProvider, Select } from 'antd';

import
{
    CloseRounded,
    InfoOutlineRounded,
    FavoriteBorderRounded,
    FavoriteRounded,
    QueueMusicRounded,
    PersonAddRounded,
    NewLabelRounded
} from '@mui/icons-material';

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

    const [value, setValue] = useState();
    const debouncedValue = useDebounce(value, 200);
    const [noMatch, setNoMatch] = useState(false);
    
    const searchSpaceValues = [...searchSpace].map(x => new String(x).toLowerCase());
    const [mathSpaceValues, setMatchSpaceValues] = matchSpace;

    useEffect(() =>
    {
        if (value === undefined) return;

        searchSpaceValues.forEach((item, index) => item.includes(debouncedValue.toLowerCase()) ? mathSpaceValues[index] = true : mathSpaceValues[index] = false);

        mathSpaceValues.includes(true) ? setNoMatch(false) : setNoMatch(true);

        setMatchSpaceValues([...mathSpaceValues]);

    }, [debouncedValue]);

    return <input type='text' value={value} onChange={({target}) => setValue(target.value)} data-no-match={noMatch} {...rest}/>
}

function CustomModal({visibility: [open, setOpen], parentRef, children})
{
    return (
        <Modal
            closeAfterTransition
            container={parentRef?.current}
            open={open}
            onClose={() => setOpen ? setOpen(false) : null}
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
            function clickOption()
            {
                visibility[1](false);
                setTimeout(() => section.functions[index](), 10);
            }

            clickables.push(
                <ROW key={`${i}${index}`} className={'contextItem'} onClick={clickOption}>
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

function SongInfoModal({visibility, parentRef, file, edit, toastEvent})
{
    const [isFavorite, setIsFavorite] = useState(false);
    const [songInfo, setSongInfo] = useState({});
    const [editedTags, setEditedTags] = useState({});
    const [folderpath, setFolderpath] = useState();

    const chooseFile = useRef();

    const { minutes, seconds } = parseTime(songInfo?.file?.duration);

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

    function inputChangeHandle(target, tag1, tag2)
    {
        setEditedTags((oldTags) =>
        {
            if (tag2 === undefined) oldTags[tag1] = target.value;
            else oldTags[tag1][tag2] = target.value;

            return structuredClone(oldTags);
        });
    }

    function addRemoveTag(tag1, tag2)
    {
        setEditedTags((oldTags) =>
        {
            if (tag2 === undefined) oldTags[tag1].push('');
            else oldTags[tag1].splice(tag2, 1);

            return structuredClone(oldTags);
        });
    }

    function handleFileChange({target})
    {
        const file = target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.addEventListener('load', () =>
        {
            setEditedTags((oldTags) =>
            {
                if (reader.result?.length > 0)
                {
                    oldTags.picture = reader.result;

                    return structuredClone(oldTags);
                }
            });
        });

        reader.readAsDataURL(file);
    }

    useEffect(() => setIsFavorite(songInfo?.extras?.isFavorite), [songInfo]);

    useEffect(() =>
    {
        if (!file) return;

        const x = file.split('\\');
        if (x.length !== 1) x.pop();
    
        const y = x.join('\\').split('/');
        if (y.length !== 1) y.pop();

        setFolderpath(y.join('/'));

        window.ipc.invoke('ipc-wantInfo', file).then((data) => { setSongInfo(data); setEditedTags(structuredClone(data.tags)); });
    }, [visibility[0]]);

    return (
        <CustomModal visibility={visibility} parentRef={parentRef}>
            <COL className={'songInfo'} style={colors}>
                <ROW className={'head relative'}>
                    <InfoOutlineRounded/>
                    <span>{edit ? 'Edit tags' : 'Song Info'}</span>
                    <button onClick={() => visibility[1](false)}><CloseRounded/></button>
                </ROW>
                <COL className={'body'}>
                    <ROW className={'file'}>
                        <ROW className={`imgWrapper ${edit ? 'changeable' : null}`}>
                            <input ref={chooseFile} style={{display: 'none'}} type='file' accept='image/*' onChange={handleFileChange}/>
                            {
                                edit ? (
                                    <img src={editedTags?.picture} onClick={() => chooseFile.current?.click()} draggable={false}/>
                                ) : (
                                    <img src={songInfo?.tags?.picture} onClick={() => window.ipc.send('ipc-newWindow', songInfo?.tags?.picture)} draggable={false}/>
                                )
                            }
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
                            { edit ? <input value={editedTags?.title} onChange={({target}) => inputChangeHandle(target, 'title')}/> : <span className='value'>{songInfo?.tags?.title || 'Unkown'}</span> }
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Album</span>
                            { edit ? <input value={editedTags?.album} onChange={({target}) => inputChangeHandle(target, 'album')}/> : <span className='value clickable' onClick={() => { visibility[1](false); eventBus.dispatchEvent(new CustomEvent('ot-showAlbum', {detail: {album: songInfo?.tags?.album, artist: songInfo?.tags?.artists[0]}})); }}>{songInfo?.tags?.album || 'Unkown'}</span> }
                        </COL>
                        <COL className={'data'}>
                            <ROW>
                                <span className='type'>Artists</span>
                                { edit ? <button onClick={() => addRemoveTag('artists')}><PersonAddRounded/></button> : null }
                            </ROW>
                            {
                                edit ? (
                                    <ROW>
                                        {
                                            editedTags?.artists?.map((x, i) =>
                                            {
                                                return (
                                                    <ROW key={i} className={'relative'}>
                                                        <input value={x} onChange={({target}) => inputChangeHandle(target, 'artists', i)}/>
                                                        <button className='remove' onClick={() => addRemoveTag('artists', i)}><CloseRounded/></button>
                                                    </ROW>
                                                )
                                            })
                                        }
                                    </ROW>
                                ) : <span className='value clickable' onClick={() => { visibility[1](false); eventBus.dispatchEvent(new CustomEvent('ot-showArtist', {detail: songInfo?.tags?.artists[0]})); }}>{songInfo?.tags?.artists?.join(', ') || 'Unkown'}</span>
                            }
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Album Artist</span>
                            { edit ? <input value={editedTags?.albumartist} onChange={({target}) => inputChangeHandle(target, 'albumartist')}/> : <span className='value'>{songInfo?.tags?.albumartist || 'Unkown'}</span> }
                        </COL>
                        <COL className={'data'}>
                            <ROW>
                                <span className='type'>Genre</span>
                                { edit ? <button onClick={() => addRemoveTag('genre')}><NewLabelRounded/></button> : null }
                            </ROW>
                            {
                                edit ? (
                                    <ROW>
                                        {
                                            editedTags?.genre?.map((x, i) =>
                                            {
                                                return (
                                                    <ROW key={i} className={'relative'}>
                                                        <input value={x} onChange={({target}) => inputChangeHandle(target, 'genre', i)}/>
                                                        <button className='remove' onClick={() => addRemoveTag('genre', i)}><CloseRounded/></button>
                                                    </ROW>
                                                )
                                            })
                                        }
                                    </ROW>
                                ) : <span className='value'>{songInfo?.tags?.genre?.join(', ') || 'Unkown'}</span>
                            }
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Tempo</span>
                            { edit ? <input value={editedTags?.bpm} onChange={({target}) => inputChangeHandle(target, 'bpm')}/> : <span className='value'>{songInfo?.tags?.bpm ? `${songInfo.tags.bpm} bpm` : 'Unkown'}</span> }
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Track Number</span>
                            { edit ? <input value={editedTags?.track?.no} onChange={({target}) => inputChangeHandle(target, 'track', 'no')}/> : <span className='value'>{songInfo?.tags?.track?.no || 'Unkown'}</span> }
                        </COL>
                        {/* <COL className={'data'}>
                            <span className='type'>Disc Number</span>
                            { edit ? <input value={editedTags?.disk?.no} onChange={({target}) => inputChangeHandle(target, 'disk', 'no')}/> : <span className='value'>{songInfo?.tags?.disk?.no || 'Unkown'}</span> }
                        </COL> */}
                        <COL className={'data'}>
                            <span className='type'>Year</span>
                            { edit ? <input value={editedTags?.year} onChange={({target}) => inputChangeHandle(target, 'year')}/> : <span className='value'>{songInfo?.tags?.year || 'Unkown'}</span> }
                        </COL>
                        <COL className={'data'}>
                            <span className='type'>Label</span>
                            { edit ? <input value={editedTags?.label} onChange={({target}) => inputChangeHandle(target, 'label')}/> : <span className='value'>{songInfo?.tags?.label || 'Unkown'}</span> }
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
                {
                    edit ? (
                        <ROW className={'foot'}>
                            <button onClick={() => { window.ipc.send('ipc-editTags', {file, tags: editedTags, toastEvent}); visibility[1](false); }}>Save Changes</button>
                            <button onClick={() => visibility[1](false)}>Dismiss</button>
                        </ROW>
                    ) : null
                }
            </COL>
        </CustomModal>
    );
}

function DeleteModal({visibility, parentRef, files, toasterId})
{
    const [hide, setHide] = useState(false);
    const actualFiles = useRef(files);

    function performDelete()
    {
        setHide(true);

        const pendingToast = toast.loading(`Deleting selected ${actualFiles.current?.length > 1 ? 'files' : 'file'} ...`, {toasterId});

        window.ipc.invoke('ipc-deleteFiles', {files: actualFiles.current}).then((success) =>
        {
            if (success)
            {
                toast.success('Deleted successfully', {id: pendingToast});
                eventBus.dispatchEvent(new Event('ot-filesDeleted'));
            }

            else toast.error(`Error deleting ${actualFiles.current?.length > 1 ? 'files' : 'file'}`, {id: pendingToast});

            visibility[1](false);
            setTimeout(() => setHide(false), 250);
        });
    }

    useEffect(() => { actualFiles.current = files }, [files]);

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

function AddToQueueModal({visibility, parentRef, files, toasterId})
{
    const [queuesList, setQueuesList] = useState([]);
    const actualFiles = useRef();

    function add(name)
    {
        window.ipc.invoke('ipc-addToQueue', {name, files: actualFiles.current}).then((success) =>
        {
            if (success)
            {
                toast.success(`${actualFiles.current?.length} ${actualFiles.current?.length > 1 ? 'songs' : 'song'} added to ${name}`, {toasterId});

                if (toasterId === 'queues') window.ipc.send('ipc-wantQueue', name);
            }

            else toast.error(`Error adding ${actualFiles.current?.length > 1 ? 'songs' : 'song'} to ${name}`, {toasterId});

            visibility[1](false);
        });
    }

    useEffect(() =>
    {
        window.ipc.on('ipc-setQueuesList', ({queues}) => setQueuesList(queues.map((name, i) => <span key={i} className='overflowPrevent' onClick={() => add(name)}>{name}</span>)));
        window.ipc.send('ipc-wantQueues');
    }, []);

    useEffect(() => { actualFiles.current = files }, [files]);

    return (
        <CustomModal visibility={visibility} parentRef={parentRef}>
            <COL className={`addToQueueModal`}>
                <ROW className={'head relative'}>
                    <QueueMusicRounded/>
                    <span>Select a queue</span>
                    <button onClick={() => visibility[1](false)}><CloseRounded/></button>
                </ROW>
                <COL className={'queuesList'}>{queuesList}</COL>
            </COL>
        </CustomModal>
    )
}

function CustomDropdown({options, select, className})
{
    return (
        <ConfigProvider
            theme={{ components: { Select: {
                optionSelectedFontWeight: 'normal',
                boxShadow: 'none',
                colorTextPlaceholder: 'white',
                colorInfoActive: 'white',
                colorBorder: 'transparent',
                activeBorderColor: 'transparent',
                hoverBorderColor: 'transparent',
                colorBgElevated: 'var(--dark20)',
                colorBgContainer: 'var(--accent2)',
                controlItemBgHover: 'var(--accent2)',
                controlItemBgActive: 'var(--accent2)'
            } } }}>
            <Select
                className={className}
                value={select[0]}
                onChange={select[1]}
                showSearch={{optionFilterProp: 'label'}}
                options={options?.map(x => { return { value: x, label: x } })}
                listHeight={128}
            />
        </ConfigProvider>
    )
}

function ColorPicker({colorState})
{
    const ref = useRef();

    const [showPalette, setShowPalette] = useState(false);

    useClickOutside(ref, () => setShowPalette(false));

    return (
        <ROW ref={ref} className={'colorPicker'}>
            <div className='color' style={{backgroundColor: colorState[0]}}/>
            <HexColorInput prefixed color={colorState[0]} onChange={colorState[1]} onClick={() => setShowPalette(true)}/>
            <div className={`picker ${showPalette ? null : 'displayNone'}`}><HexColorPicker color={colorState[0]} onChange={colorState[1]}/></div>
        </ROW>
    )
}

export {
    ROW,
    COL,
    GRID,
    Slider,
    Hover3D,
    SearchBox,
    CustomModal,
    ContextMenu,
    SongInfoModal,
    DeleteModal,
    AddToQueueModal,
    CustomDropdown,
    ColorPicker
};