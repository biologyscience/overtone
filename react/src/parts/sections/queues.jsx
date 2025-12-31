import {  useEffect, useRef, useState } from 'react';
import { COL, ROW, CustomModal } from '../../util/components';
import SortableList from '../../util/sortable';

import { parseTime } from '../../util/functions';

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
        [currentQueueSongNumber, setCurrentQueueSongNumber] = useState(0),
        [queuesList, setQueuesList] = useState();

    useEffect(() =>
    {        
        window.ipc.invoke('ipc-wantFolder').then((songData) =>
        {
            setSongsData(songData);
        });

    }, []);

    useEffect(() =>
    {
        function click({target})
        {
            const { filePath } = target.parentElement.dataset;

            if (target.tagName === 'BUTTON')
            {
                // options
            }

            else
            {
                // play filePath
            }
        }

        setCurrentQueueList(
            songsData?.map(({title, artist, album, duration, location}, i) =>
            {
                const
                    { minutes, seconds } = parseTime(duration),
                    durationText = `${minutes}:${seconds}`;

                return (
                    <div key={i} id={crypto.randomUUID()} className='listItem' onClick={click} data-file-path={location}>
                        <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                        <COL className='songData'>
                            <span className='title overflowPrevent'>{title}</span>
                            <span className='artist overflowPrevent'>{artist}</span>
                            <ROW>
                                <span className='album overflowPrevent'>{album}</span>
                                <span className='duration'>{durationText}</span>
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
                    <div key={i} id={crypto.randomUUID()} className='listItem' onClick={click} data-file-path={location}>
                        <button data-is-drag-handle={true} className='drag'><DragHandleRounded/></button>
                        <span className='name'>{title}</span>
                        <button><EditRounded/></button>
                        <button><DeleteRounded/></button>
                    </div>
                )
            })
        );

    }, [songsData]);

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
                    <span className='name'>Queues</span>
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
                        <span>00:00</span>
                    </ROW>
                </ROW>
            </COL>
            <COL className='currentQueueList'>
                <SortableList>{currentQueueList}</SortableList>
            </COL>
        </COL>
    )
}