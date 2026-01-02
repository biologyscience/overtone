import { useEffect, useRef, useState } from 'react';
import { COL, ROW, CustomModal } from '../../util/components';
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
    EditRounded
    
} from '@mui/icons-material';

export default function queues()
{
    const sectionRef = useRef();

    const
        [songsData, setSongsData] = useState(),
        [showModal, setShowModal] = useState(false),
        [currentQueueSongNumber, setCurrentQueueSongNumber] = useState(-1),
        [queuesList, setQueuesList] = useState(),
        [currentQueueName, setCurrentQueueName] = useState('Queues'),
        [queueDuration, setQueueDuration] = useState('--:--'),
        [playingQueueName, setPlayingQueueName] = useState(),
        [playingTrackNumber, setPlayingTrackNumber] = useState(-1)
    
    function switchToTrack(name, index)
    {
        window.ipc.send('ipc-audioPlayer-switchToTrack', {queueName: name, index});

        setPlayingTrackNumber(index);
    }

    useEffect(() =>
    {
        if (!showModal) return;

        window.ipc.invoke('ipc-wantQueues').then((queueNames) =>
        {
            setQueuesList(
                queueNames.map((name, i) =>
                {
                    return (
                        <div key={i} id={crypto.randomUUID()} className={`listItem ${playingQueueName === name ? 'current' : ''}`}>
                            <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                            <span className='name' onClick={() => window.ipc.send('ipc-wantQueue', name)}>{name}</span>
                            <button><EditRounded/></button>
                            <button><DeleteRounded/></button>
                        </div>
                    )
                })
            );
        });

    }, [showModal, playingQueueName]);

    useEffect(() =>
    {
        const items = [...sectionRef.current.querySelectorAll('.currentQueueList .listItem')];

        items.forEach((item, i) =>
        {
            item.classList.remove('current');

            if (currentQueueSongNumber === i) item.classList.add('current');
        });

    }, [currentQueueSongNumber]);

    useEffect(() =>
    {
        if (playingQueueName !== currentQueueName) return;

        setCurrentQueueSongNumber(playingTrackNumber);

    }, [playingTrackNumber, currentQueueName, playingQueueName])

    useEffect(() =>
    {
        window.ipc.on('ipc-setCurrentQueue', ({songs, queueName, trackNumber, duration}) =>
        {
            setSongsData(songs);
            setCurrentQueueName(queueName);
            setCurrentQueueSongNumber(trackNumber);
            setQueueDuration(duration);
            setShowModal(false);
        });

        eventBus.addEventListener('ot-next', () => setPlayingTrackNumber(x => x + 1))
        eventBus.addEventListener('ot-previous', () => setPlayingTrackNumber(x => x - 1));

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
                        <SortableList>{queuesList}</SortableList>
                    </COL>
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
                <SortableList>
                    {
                        songsData?.map(({title, artists, album, duration}, i) =>
                        {
                            return (
                                <div key={i} id={crypto.randomUUID()} className='listItem'>
                                    <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                                    <COL className='songData' onClick={() => switchToTrack(currentQueueName, i)}>
                                        <span className='title overflowPrevent'>{title}</span>
                                        <span className='artist overflowPrevent'>{artists.join(', ')}</span>
                                        <ROW>
                                            <span className='album overflowPrevent'>{album}</span>
                                            <span className='duration'>{duration}</span>
                                        </ROW>
                                    </COL>
                                    <button><MoreHorizRounded/></button>
                                </div>
                            )
                        })
                    }
                </SortableList>
            </COL>
        </COL>
    )
}