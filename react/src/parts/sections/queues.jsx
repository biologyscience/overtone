import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { COL, ROW, CustomModal, ContextMenu, SongInfoModal, DeleteModal, AddToQueueModal } from '../../util/components';
import SortableList from '../../util/sortable';
import eventBus from '../../util/events';

import
{
    DeleteRounded,
    MoreHorizRounded,
    DragHandleRounded,
    ChevronRightRounded,
    ScheduleRounded,
    QueueMusicRounded,
    CloseRounded,
    EditRounded,
    CheckRounded,
    InfoOutlineRounded,
    PlaylistAddRounded,
    PlaylistRemoveRounded,
    PauseCircleOutlineRounded,
    SelectAllRounded,
    DeselectRounded,
    SaveAsRounded,
    CheckBoxRounded,
    CheckBoxOutlineBlankRounded
} from '@mui/icons-material';

export default function queues()
{
    const sectionRef = useRef();

    const
        [songsData, setSongsData] = useState(),
        [showModal, setShowModal] = useState(false),
        [currentQueueSongNumber, setCurrentQueueSongNumber] = useState(-1),
        [queuesList, setQueuesList] = useState(),
        [showRenamer, setShowRenamer] = useState(false),
        [renamingQueue, setRenamingQueue] = useState(false),
        [renamePosition, setRenamePosition] = useState(0),
        [rename, setRename] = useState([]),
        [currentQueueName, setCurrentQueueName] = useState(),
        [queueDuration, setQueueDuration] = useState('--:--'),
        [playingQueueName, setPlayingQueueName] = useState(),
        [playingTrackNumber, setPlayingTrackNumber] = useState(-1),
        [showContextMenu, setShowContextMenu] = useState(false),
        [contextData, setContextData] = useState({}),
        [showAddToQueueModal, setShowAddToQueueModal] = useState(false),
        [showSongInfoModal, setShowSongInfoModal] = useState(false),
        [showDeleteModal, setShowDeleteModal] = useState(false),
        [selectedFiles, setSelectedFiles] = useState([]),
        [multiSelect, setMultiSelect] = useState(false);
    
    function selectItems(filepath)
    {
        setSelectedFiles((oldArray) =>
        {
            const set = new Set(oldArray);
    
            if (set.has(filepath)) set.delete(filepath);
            else set.add(filepath);

            return [...set];
        });
    }

    function openContext(data)
    {
        if (multiSelect) setContextData({title: selectedFiles?.length > 1 ? `${selectedFiles?.length} selected files` : '1 selected file'});

        else
        {
            selectItems(data.filepath);
            setContextData({title: data.title, position: data.i, filepath: data.filepath});
        }
        
        setShowContextMenu(true);
    }
    
    function focusSongInQueue()
    {
        setTimeout(() =>
        {
            const element = sectionRef.current.querySelector('.currentQueueList .listItem.current');
    
            if (element) element.scrollIntoView({behavior: 'smooth', block: 'center', container: 'nearest'});
        }, 50);
    }

    useEffect(() =>
    {
        if (!showModal) return;

        setRenamingQueue(false);

        window.ipc.send('ipc-wantQueues');

        setTimeout(() =>
        {
            const element = sectionRef.current.querySelector('.queuesHolder .queuesList .listItem.current');
    
            if (element) element.scrollIntoView({behavior: 'smooth', block: 'center', container: 'nearest'});
        }, 50);

    }, [showModal]);

    useEffect(() =>
    {
        if (playingQueueName !== currentQueueName) return;

        focusSongInQueue();

    }, [currentQueueName, playingQueueName]);

    useEffect(() =>
    {
        function reloadQueue() { window.ipc.send('ipc-wantQueue', currentQueueName); };
        function handle({detail: [oldOrder, newOrder]}) { window.ipc.send('ipc-reorderQueue', {queueName: currentQueueName, oldOrder, newOrder}); }
        function handle2({detail})
        {
            if (detail !== 0) return;

            reloadQueue();
        }

        eventBus.addEventListener('ot-songsInQueueReorder', handle);
    }, [currentQueueName]);

    useEffect(() =>
    {
        setTimeout(() =>
        {
            setShowRenamer(renamingQueue);
            setTimeout(() => sectionRef.current.querySelector('.renamer input')?.focus(), 5);
            
        }, 10);

        if (renamingQueue === false)
        {
            const [oldName, newName] = rename;

            window.ipc.send('ipc-renameQueue', {oldName, newName});
        }

        else
        {
            setRename([renamingQueue, renamingQueue]);

            const queuesHolder = document.querySelector('.section#queues .queuesHolder');
            const item = queuesHolder.querySelector(`.queuesList .listItem[data-name="${renamingQueue}"]`);

            setRenamePosition((3 + item.getBoundingClientRect().top - queuesHolder.getBoundingClientRect().top) + 'px');
        }

    }, [renamingQueue]);

    useEffect(() => setSelectedFiles([]), [multiSelect]);

    useEffect(() =>
    {
        window.ipc.on('ipc-setCurrentQueue', ({songs, queueName, trackNumber, duration}) =>
        {
            setSongsData(songs);
            setCurrentQueueName(queueName);
            setCurrentQueueSongNumber(trackNumber);
            setQueueDuration(duration);
            setShowModal(false);
            setShowSongInfoModal(false);
            setShowContextMenu(false);
            setSelectedFiles([]);
            setMultiSelect(false);

            focusSongInQueue();
        });
        
        window.ipc.on('ipc-setPlayingQueueData', ({queueName, trackNumber}) =>
        {
            setPlayingQueueName(queueName);
            setPlayingTrackNumber(trackNumber);
        });

        window.ipc.on('ipc-setQueuesList', ({queues, current}) =>
        {
            setQueuesList(
                queues.map((name, i) =>
                {
                    return (
                        <div key={i} id={crypto.randomUUID()} className={`listItem ${name === current ? 'current' : ''}`} data-name={name}>
                            <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                            <span className='name overflowPrevent' onClick={() => window.ipc.send('ipc-wantQueue', name)}>{name}</span>
                            <button onClick={() => setRenamingQueue(name)}><EditRounded/></button>
                            <button onClick={() => window.ipc.send('ipc-deleteQueue', {name})}><DeleteRounded/></button>
                        </div>
                    )
                })
            );
        });

        eventBus.addEventListener('ot-queuesReorder', ({detail: [oldOrder, newOrder]}) => window.ipc.send('ipc-reorderQueues', {oldOrder, newOrder}));
        eventBus.addEventListener('ot-focusSongInQueue', focusSongInQueue);
        eventBus.addEventListener('ot-navChange', () => setSelectedFiles([]));

        window.ipc.on('ipc-queuesToast', ({type, text}) => toast[type](text, {toasterId: 'queues'}));
    }, []);

    return (
        <COL ref={sectionRef} className='section relative' id='queues'>
            <CustomModal visibility={[showModal, setShowModal]} parentRef={sectionRef}>
                <COL className={'queuesHolder'}>
                    <ROW className={'head relative'}>
                        <QueueMusicRounded/>
                        <span>Queues</span>
                        <button onClick={() => setShowModal(false)}><CloseRounded/></button>
                    </ROW>
                    <COL className={'queuesList'}>
                        <SortableList setOrder={'ot-queuesReorder'}>{queuesList}</SortableList>
                    </COL>
                    <div className={`renamer ${showRenamer === false ? 'displayNone' : 'grid'}`} style={{'--top': renamePosition}}>
                        <button><DragHandleRounded/></button>
                        <input value={rename[1]} onChange={({target}) => setRename(x => x = [x[0], target.value])}/>
                        <button onClick={() => setRenamingQueue(false)}><CheckRounded/></button>
                        <button><DeleteRounded/></button>
                    </div>
                </COL>
            </CustomModal>
            <COL className={'head'}>
                <ROW className={'queueSelector'} onClick={() => setShowModal(true)}>
                    <span className='name overflowPrevent'>{currentQueueName === playingQueueName ? playingQueueName : currentQueueName}</span>
                    <ChevronRightRounded/>
                </ROW>
                <ROW className={'currentQueueInfo'}>
                    <button onClick={() => setMultiSelect(x => !x)} className={multiSelect ? 'focus' : null}>{multiSelect ? <DeselectRounded/> : <SelectAllRounded/>}</button>
                    <ROW className={'songNumbers'}>
                        <strong>{currentQueueName === playingQueueName ? playingTrackNumber + 1 : currentQueueSongNumber + 1}</strong>
                        <span>/</span>
                        <span>{songsData?.length}</span>
                    </ROW>
                    <ROW className={'queueDuration'}>
                        <ScheduleRounded/>
                        <span>{queueDuration}</span>
                    </ROW>
                    <button onClick={() => window.ipc.send('ipc-saveAsM3U', currentQueueName)}><SaveAsRounded/></button>
                </ROW>
            </COL>
            <COL className={`currentQueueList ${currentQueueName === playingQueueName ? 'playing' : ''}`}>
                <SortableList setOrder={'ot-songsInQueueReorder'} disable={multiSelect}>
                    {
                        songsData?.map((data, i) =>
                        {
                            if (currentQueueName === playingQueueName) data.current = playingTrackNumber === i;
                            else data.current = currentQueueSongNumber === i;

                            return data;

                        }).map(({title, artists, album, duration, filepath, current}, i) =>
                        {
                            return (
                                <div key={i} id={crypto.randomUUID()} className={`listItem ${current ? 'current' : ''}`} onContextMenu={() => openContext({title, i, filepath})}>
                                    {
                                        multiSelect ? (
                                            <button onClick={() => selectItems(filepath)}>{ selectedFiles?.includes(filepath) ? <CheckBoxRounded/> : <CheckBoxOutlineBlankRounded/> }</button>
                                        ) : (
                                            <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                                        )
                                    }
                                    <COL className='songData' onClick={() => multiSelect ? null : window.ipc.send('ipc-audioPlayer-switchToTrack', {queueName: currentQueueName, index: i})}>
                                        <span className='title overflowPrevent'>{title}</span>
                                        <span className='artist overflowPrevent'>{artists.join(', ')}</span>
                                        <ROW>
                                            <span className='album overflowPrevent'>{album}</span>
                                            <span className='duration'>{duration}</span>
                                        </ROW>
                                    </COL>
                                    <button onClick={() => openContext({title, i, filepath})}><MoreHorizRounded/></button>
                                </div>
                            )
                        })
                    }
                </SortableList>
            </COL>
            <AddToQueueModal
                visibility={[showAddToQueueModal, setShowAddToQueueModal]}
                parentRef={sectionRef}
                files={selectedFiles}
                toasterId={'queues'}
            />
            <SongInfoModal
                visibility={[showSongInfoModal, setShowSongInfoModal]}
                parentRef={sectionRef}
                file={selectedFiles[0]}
            />
            <DeleteModal
                visibility={[showDeleteModal, setShowDeleteModal]}
                parentRef={sectionRef}
                files={selectedFiles}
                toasterId={'queues'}
            />
            <ContextMenu
                visibility={[showContextMenu, setShowContextMenu]}
                title={contextData?.title}
                options={
                    multiSelect ? [
                        {
                            functions: [
                                () => setShowAddToQueueModal(true),
                                () => window.ipc.send('ipc-removeFromQueue', {name: currentQueueName, files: selectedFiles}),
                            ],
                            icons: [<PlaylistAddRounded/>, <PlaylistRemoveRounded/>],
                            texts: ['Add to a queue', 'Remove from queue']
                        },
                        {
                            functions: [
                                () => setShowDeleteModal(true)
                            ],
                            icons: [<DeleteRounded/>],
                            texts: ['Delete permanently']
                        }
                    ] : [
                        {
                            functions: [
                                () => setShowAddToQueueModal(true),
                                () => window.ipc.send('ipc-removeFromQueue', {name: currentQueueName, files: selectedFiles}),
                                () => window.ipc.send('ipc-stopAfter', selectedFiles[0])
                            ],
                            icons: [<PlaylistAddRounded/>, <PlaylistRemoveRounded/>, <PauseCircleOutlineRounded/>],
                            texts: ['Add to a queue', 'Remove from queue', 'Stop after this song']
                        },
                        {
                            functions: [
                                () => setShowSongInfoModal(true),
                                () => setShowDeleteModal(true)
                            ],
                            icons: [<InfoOutlineRounded/>, <DeleteRounded/>],
                            texts: ['Song info', 'Delete permanently']
                        }
                    ]
                }
                parentRef={sectionRef}
            />
            <Toaster
                toasterId='queues'
                position='bottom-right'
                containerStyle={{
                    position: 'absolute',
                    fontSize: '.8rem'
                }}
            />
        </COL>
    )
}