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
        [currentQueueList, setCurrentQueueList] = useState(),
        [currentQueueSongNumber, setCurrentQueueSongNumber] = useState(-1),
        [queuesList, setQueuesList] = useState(),
        [currentQueueName, setCurrentQueueName] = useState('Queues'),
        [queueDuration, setQueueDuration] = useState('--:--');

    useEffect(() =>
    {
        window.ipc.on('ipc-setCurrentQueue', ({songs, queueName, trackNumber, duration}) =>
        {
            setSongsData(songs);
            setCurrentQueueName(queueName);
            setCurrentQueueSongNumber(trackNumber);
            setQueueDuration(duration)
        });

        eventBus.addEventListener('ot-next', () => setCurrentQueueSongNumber(x => x + 1))
        eventBus.addEventListener('ot-previous', () => setCurrentQueueSongNumber(x => x - 1));

    }, []);

    useEffect(() =>
    {
        function switchToTrack(index)
        {
            window.ipc.send('ipc-audioPlayer-switchToTrack', index);

            setCurrentQueueSongNumber(index);
        }

        setCurrentQueueList(
            songsData?.map(({title, artists, album, duration}, i) =>
            {
                return (
                    <div key={i} id={crypto.randomUUID()} className='listItem'>
                        <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                        <COL className='songData' onClick={() => switchToTrack(i)}>
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
        );

        setQueuesList(
            songsData?.map(({title, location}, i) =>
            {
                return (
                    <div key={i} id={crypto.randomUUID()} className='listItem' data-file-path={location}>
                        <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                        <span className='name'>{title}</span>
                        <button><EditRounded/></button>
                        <button><DeleteRounded/></button>
                    </div>
                )
            })
        );

    }, [songsData]);

    useEffect(() =>
    {
        const items = [...sectionRef.current.querySelectorAll('.currentQueueList .listItem')];

        items.forEach((item, i) =>
        {
            item.classList.remove('current');

            if (currentQueueSongNumber === i) item.classList.add('current');
        });

    }, [currentQueueSongNumber]);

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
                        <strong>{currentQueueSongNumber + 1}</strong>
                        <span>/</span>
                        <span>{currentQueueList?.length}</span>
                    </ROW>
                    <ROW className={'queueDuration'}>
                        <ScheduleRounded/>
                        <span>{queueDuration}</span>
                    </ROW>
                </ROW>
            </COL>
            <COL className='currentQueueList'>
                <SortableList>{currentQueueList}</SortableList>
            </COL>
        </COL>
    )
}