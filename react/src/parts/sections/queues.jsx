import { useEffect, useRef, useState } from 'react';
import { COL, ROW, CustomModal, ContextMenu } from '../../util/components';
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
    PauseCircleOutlineRounded
} from '@mui/icons-material';

export default function queues()
{
    const sectionRef = useRef();

    const
        [songsData, setSongsData] = useState(),
        [showModal, setShowModal] = useState(false),
        [currentQueueSongNumber, setCurrentQueueSongNumber] = useState(-1),
        [queuesList, setQueuesList] = useState(),
        [renamingQueue, setRenamingQueue] = useState(false),
        [renamePosition, setRenamePosition] = useState(0),
        [rename, setRename] = useState([]),
        [currentQueueName, setCurrentQueueName] = useState('Queues'),
        [queueDuration, setQueueDuration] = useState('--:--'),
        [playingQueueName, setPlayingQueueName] = useState(),
        [playingTrackNumber, setPlayingTrackNumber] = useState(-1),
        [showContextMenu, setShowContextMenu] = useState(false),
        [contextData, setContextData] = useState({});
    
    function switchToTrack(name, index)
    {
        window.ipc.send('ipc-audioPlayer-switchToTrack', {queueName: name, index});

        setPlayingTrackNumber(index);
    }

    function openContext(data)
    {
        setContextData({title: data.title, position: data.i});
        setShowContextMenu(true);
    }

    useEffect(() =>
    {
        if (!showModal) return;

        setRenamingQueue(false);

        window.ipc.send('ipc-wantQueues');

    }, [showModal]);

    useEffect(() =>
    {
        if (playingQueueName !== currentQueueName) return;

        setCurrentQueueSongNumber(playingTrackNumber);

    }, [playingTrackNumber, currentQueueName, playingQueueName]);

    useEffect(() =>
    {
        function handle({detail: [oldOrder, newOrder]})
        {
            window.ipc.send('ipc-reorderQueue', {queueName: currentQueueName, oldOrder, newOrder});
        }

        eventBus.addEventListener('ot-songsInQueueReorder', handle);

        return () => { eventBus.removeEventListener('ot-songsInQueueReorder', handle); }

    }, [currentQueueName]);

    useEffect(() =>
    {
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

    useEffect(() =>
    {
        function focusSongInQueue()
        {
            requestAnimationFrame(() =>
            {
                requestAnimationFrame(() =>
                {
                    const element = sectionRef.current.querySelector('.currentQueueList .listItem.current');

                    if (element) element.scrollIntoView({behavior: 'smooth', block: 'center', container: 'nearest'});
                });
            });
        }

        window.ipc.on('ipc-setCurrentQueue', ({songs, queueName, trackNumber, duration}) =>
        {
            setSongsData(songs);
            setCurrentQueueName(queueName);
            setCurrentQueueSongNumber(trackNumber);
            setQueueDuration(duration);
            setShowModal(false);
            setShowContextMenu(false);

            focusSongInQueue();
        });

        window.ipc.on('ipc-setQueuesList', ({queues, current}) =>
        {
            setQueuesList(
                queues.map((name, i) =>
                {
                    return (
                        <div key={i} id={crypto.randomUUID()} className={`listItem ${name === current ? 'current' : ''}`} data-name={name}>
                            <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                            <span className='name' onClick={() => window.ipc.send('ipc-wantQueue', name)}>{name}</span>
                            <button onClick={() => setRenamingQueue(name)}><EditRounded/></button>
                            <button onClick={() => window.ipc.send('ipc-deleteQueue', {name})}><DeleteRounded/></button>
                        </div>
                    )
                })
            );
        });

        eventBus.addEventListener('ot-next', () => setPlayingTrackNumber(x => x + 1))
        eventBus.addEventListener('ot-previous', () => setPlayingTrackNumber(x => x - 1));
        eventBus.addEventListener('ot-queuesReorder', ({detail: [oldOrder, newOrder]}) => window.ipc.send('ipc-reorderQueues', {oldOrder, newOrder}));
        eventBus.addEventListener('ot-focusSongInQueue', focusSongInQueue);

        window.ipc.on('ipc-playingQueueName', setPlayingQueueName);
        window.ipc.on('ipc-playingTrackNumber', setPlayingTrackNumber);
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
                    <div className={`renamer ${renamingQueue === false ? 'displayNone' : 'grid'}`} style={{'--top': renamePosition}}>
                        <button><DragHandleRounded/></button>
                        <input value={rename[1]} onChange={({target}) => setRename(x => x = [x[0], target.value])}/>
                        <button onClick={() => setRenamingQueue(false)}><CheckRounded/></button>
                        <button><DeleteRounded/></button>
                    </div>
                </COL>
            </CustomModal>
            <COL className={'head'}>
                <ROW className={'queueSelector'} onClick={() => setShowModal(true)}>
                    <span className='name'>{currentQueueName}</span>
                    <ChevronRightRounded/>
                </ROW>
                <ROW className={'currentQueueInfo'}>
                    <ROW className={'songNumbers'}>
                        <strong>{currentQueueName === playingQueueName ? playingTrackNumber + 1 : currentQueueSongNumber + 1}</strong>
                        <span>/</span>
                        <span>{songsData?.length}</span>
                    </ROW>
                    <ROW className={'queueDuration'}>
                        <ScheduleRounded/>
                        <span>{queueDuration}</span>
                    </ROW>
                </ROW>
            </COL>
            <COL className={`currentQueueList ${currentQueueName === playingQueueName ? 'playing' : ''}`}>
                <SortableList setOrder={'ot-songsInQueueReorder'}>
                    {
                        songsData?.map(({title, artists, album, duration}, i) =>
                        {
                            return (
                                <div key={i} id={crypto.randomUUID()} className={`listItem ${currentQueueSongNumber === i ? 'current' : ''}`} onContextMenu={() => openContext({title, i})}>
                                    <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                                    <COL className='songData' onClick={() => switchToTrack(currentQueueName, i)}>
                                        <span className='title overflowPrevent'>{title}</span>
                                        <span className='artist overflowPrevent'>{artists.join(', ')}</span>
                                        <ROW>
                                            <span className='album overflowPrevent'>{album}</span>
                                            <span className='duration'>{duration}</span>
                                        </ROW>
                                    </COL>
                                    <button onClick={() => openContext({title, i})}><MoreHorizRounded/></button>
                                </div>
                            )
                        })
                    }
                </SortableList>
            </COL>
            <ContextMenu
                visibility={[showContextMenu, setShowContextMenu]}
                title={contextData?.title}
                options={[
                    {
                        functions: [
                            () => {},
                            () => window.ipc.send('ipc-removeFromQueue', {name: currentQueueName, position: contextData.position}),
                            () => {}
                        ],
                        icons: [<PlaylistAddRounded/>, <PlaylistRemoveRounded/>, <PauseCircleOutlineRounded/>],
                        texts: ['Add to a queue', 'Remove from queue', 'Stop after this song']
                    },
                    {
                        functions: [() => {}, () => {}],
                        icons: [<InfoOutlineRounded/>, <DeleteRounded/>],
                        texts: ['Song info', 'Delete permanently']
                    }
                ]}
                parentRef={sectionRef}
            />
        </COL>
    )
}