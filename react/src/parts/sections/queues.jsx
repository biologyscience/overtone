import {  useEffect, useRef, useState } from 'react';
import { COL, ROW, CustomModal, SortableList } from '../../util/components';

import { parseTime } from '../../util/functions';

import
{
    FolderRounded,
    DeleteRounded,
    MoreHorizRounded,
    DragHandleRounded,
    ChevronRightRounded
    
} from '@mui/icons-material';

export default function queues()
{
    const sectionRef = useRef();

    const
        [showInside, setShowInside] = useState(false),
        [folderPaths, setFolderPaths] = useState([]),
        [selectedFolders, setSelectedFolders] = useState(),
        [deleteSelected, setDeleteSelected] = useState(false),
        [folderName, setFolderName] = useState(),
        [songsData, setSongsData] = useState(),
        [folderDuration, setFoldarDuration] = useState(),
        [inputSearchSpace, setInputSearchSpace] = useState(),
        [inputMatchSpace, setInputMatchSpace] = useState(),
        [showModal, setShowModal] = useState(false),
        [currentQueueList, setCurrentQueueList] = useState();
    
    function handleFolderClick({target})
    {
        const { index } = target.dataset;

        if (deleteSelected)
        {
            const temp = [...selectedFolders];
            temp[index] = !temp[index];
            
            setSelectedFolders(temp);
        }

        else
        {
            const folder = folderPaths[index];

            setFolderName(folder.split('/').pop().split('\\').pop());

            window.ipc.invoke('ipc-wantFolder', folder).then((songData) =>
            {
                let totalDuration = 0;
             
                songData?.forEach(({duration}) => totalDuration += duration);
                const { hours, minutes, seconds } = parseTime(totalDuration);
                setFoldarDuration(`${hours}:${minutes}:${seconds}`);

                setInputSearchSpace(songData.map(x => x.title));
                setInputMatchSpace(songData.map(x => true));
                setSongsData(songData);
                setShowInside(true);
            });
        }
    }

    function handleDeleteClick()
    {
        if (deleteSelected && selectedFolders.filter(x => x).length > 0)
        {
            const toDelete = [];

            selectedFolders.forEach((x, i) => x ? toDelete.push(folderPaths[i]) : null);

            window.ipc.invoke('ipc-deleteFolders', toDelete).then((newFolders) =>
            {
                const temp = [...newFolders].map(x => false);

                setSelectedFolders(temp);
                setFolderPaths(newFolders);
            });
        }

        setDeleteSelected(x => !x);
    }

    function FolderList()
    {
        const components = [];
    
        folderPaths.forEach((folderPath, i) =>
        {
            const folderName = folderPath.split('/').pop().split('\\').pop();

            components.push(
                <li className={`folder ${selectedFolders?.[i] ? 'delete' : ''}`} onClick={handleFolderClick} key={i} data-index={i}>
                    <FolderRounded/>
                    <COL>
                        <span className='name'>{folderName}</span>
                        <span className='path'>{folderPath}</span>
                    </COL>
                    <button className='deleteButton'><DeleteRounded/></button>
                </li>
            );
        });

        return components;
    }

    function DeleteText()
    {
        const count = selectedFolders?.filter(x => x)?.length;

        return (
            <span>
                {
                    deleteSelected ? count === 0 ? (
                        'Select folders to remove, or click here to cancel'
                    ) : `Click here to remove ${count} folder${count > 1 ? 's' : ''}` : (
                        'Remove folders'
                    )
                }
            </span>
        )
    }

    useEffect(() =>
    {
        window.ipc.invoke('ipc-wantFolders').then((folderData) =>
        {
            setFolderPaths(folderData);
            setSelectedFolders([...folderData].map(x => false));
        });
        
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

    }, [songsData]);

    return (
        <COL ref={sectionRef} className='section relative' id='queues'>
            <CustomModal visibility={[showModal, setShowModal]} parentRef={sectionRef}>
                
            </CustomModal>
            <COL className={'head'}>
                <ROW className={'queueListMenu'} onClick={() => setShowModal(true)}>
                    <span className='name'>Queues</span>
                    <ChevronRightRounded/>
                </ROW>
            </COL>
            <div className='currentQueueList'>
                <SortableList>{currentQueueList}</SortableList>
            </div>
        </COL>
    )
}

/**
 * 

 *          <section class="queue flexCol relative">
                <div id="queueListMenu" class="absolute flexCol">
                    <div class="head flex relative">
                        <img src="svg/queue.svg">
                        <span>Queues</span>
                        <button class="close absolute">
                            <img src="svg/close.svg">
                        </button>
                    </div>
                    <ul id="queueList"></ul>
                </div>

                <div class="headBottom flex justifyContentCenter relative">
                    <strong><span id="currentSongIndex">-</span></strong>
                    <span>/</span>
                    <span id="totalSongsInCurrentQueue">-</span>
                </div>
            </section>



 */