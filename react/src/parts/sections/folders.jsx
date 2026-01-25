import { useEffect, useState, useRef } from 'react';
import { COL, ROW, GRID, SearchBox, ContextMenu } from '../../util/components';

import { parseTime } from '../../util/functions';

import toast, { Toaster } from 'react-hot-toast';

import
{
    FolderRounded,
    DeleteRounded,
    SyncRounded,
    CreateNewFolderRounded,
    RemoveCircleOutlineRounded,
    ChevronLeftRounded,
    NumbersRounded,
    ScheduleRounded,
    SearchRounded,
    MoreHorizRounded,
    InfoOutlineRounded,
    PlaylistAddRounded,
    StartRounded,
    DriveFileMoveRounded,
    EditRounded
    
} from '@mui/icons-material';

export default function folders()
{
    const sectionRef = useRef();
    const toastRef = useRef('');

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
        [showContextMenu, setShowContextMenu] = useState(false),
        [contextData, setContextData] = useState({});
    
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
                setFoldarDuration(parseTime(totalDuration).text);

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
        return folderPaths.map((folderPath, i) =>
        {
            const folderName = folderPath.split('/').pop().split('\\').pop();

            return (
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

    function openContext(data)
    {
        setContextData({title: data.title});
        setShowContextMenu(true);
    }

    function Songs()
    {
        function click({target})
        {
            const { filePath } = target.parentElement.dataset;

            if (target.tagName === 'BUTTON') return;

            // play filePath
        }

        let totalDuration = 0;

        return songsData?.map(({title, artist, album, duration, location}, i) =>
        {
            totalDuration += duration;
    
            return (
                <li key={i} onClick={click} className={`${inputMatchSpace?.[i] ? '' : 'displayNone'}`} data-file-path={location} onContextMenu={() => openContext({title})}>
                    <COL className='songData'>
                        <span className='title overflowPrevent'>{title}</span>
                        <span className='artist overflowPrevent'>{artist}</span>
                        <ROW>
                            <span className='album overflowPrevent'>{album}</span>
                            <span className='duration'>{parseTime(duration).text}</span>
                        </ROW>
                    </COL>
                    <button onClick={() => openContext({title})}><MoreHorizRounded/></button>
                </li>
            );
        });
    }

    useEffect(() =>
    {
        window.ipc.invoke('ipc-wantFolders').then((folderData) =>
        {
            setFolderPaths(folderData);
            setSelectedFolders([...folderData].map(x => false));
        });

        window.ipc.on('ipc-newFoldersFiles', ({folders, songCount}) =>
        {
            let
                text = 'Library is up to date',
                folderType = null,
                filesType = null;

            if (folders?.count > 0) folderType = 'Added';
            if (folders?.count < 0) folderType = 'Removed';
            if (songCount > 0) filesType = 'Added';
            if (songCount < 0) filesType = 'Removed';

            songCount = Math.abs(songCount);
            
            const
                folderCount = Math.abs(folders?.count),
                folderPlural = folderCount > 1 ? 'folders' : 'folder',
                songPlural = songCount > 1 ? 'songs' : 'song';

            if (folderType)
            {
                if (folderType === filesType) text = `${folderType} ${folderCount} ${folderPlural} and ${songCount} ${songPlural}`;

                else text = `${folderType} ${folderCount} ${folderPlural} and ${filesType} ${songCount} ${songPlural}`;
            }

            else if (filesType) text = `${filesType} ${songCount} ${songPlural}`;

            toast.success(text, {id: toastRef.current});

            setFolderPaths((old) =>
            {
                if (folders?.list === undefined)
                {
                    toast.dismiss(toastRef.current);

                    return old;
                }

                else return folders.list;
            });
        });
    }, []);

    return (
        <COL ref={sectionRef} className='section relative' id='folders'>
            <COL className={`out ${showInside ? 'displayNone' : ''}`}>
                <ul className='folders'>
                    <FolderList/>
                </ul>
                <ul className='folderOptions'>
                    <li className='folderOption' onClick={() => { toastRef.current = toast.loading('Scanning ...', {toasterId: 'folders'});  window.ipc.send('ipc-addFolders'); }}>
                        <CreateNewFolderRounded/>
                        <span>Add folders</span>
                    </li>
                    <li className={`folderOption ${deleteSelected ? 'selected' : ''}`} onClick={handleDeleteClick}>
                        <RemoveCircleOutlineRounded/>
                        <DeleteText/>
                    </li>
                    <li className='folderOption' onClick={() => { toastRef.current = toast.loading('Scanning ...', {toasterId: 'folders'});  window.ipc.send('ipc-updateFiles'); }}>
                        <SyncRounded/>
                        <span>Sync files</span>
                    </li>
                </ul>
            </COL>
            <COL className={`in ${showInside ? '' : 'displayNone'}`}>
                <ROW className='head'>
                    <button onClick={() => setShowInside(false)}><ChevronLeftRounded/></button>
                    <span className='name'>{folderName}</span>
                </ROW>
                <GRID className='info'>
                    <ROW>
                        <NumbersRounded/>
                        <span>{songsData?.length}</span>
                    </ROW>
                    <ROW>
                        <ScheduleRounded/>
                        <span>{folderDuration}</span>
                    </ROW>
                    <GRID className='searchBar'>
                        <SearchRounded/>
                        <SearchBox searchSpace={inputSearchSpace} matchSpace={[inputMatchSpace, setInputMatchSpace]} placeholder='Search song titles'/>
                    </GRID>
                </GRID>
                <ul className='songList'><Songs/></ul>
            </COL>
            <ContextMenu
                visibility={[showContextMenu, setShowContextMenu]}
                title={contextData?.title}
                options={[
                    {
                        functions: [() => {}, () => {}],
                        icons: [<PlaylistAddRounded/>, <StartRounded/>],
                        texts: ['Add to a queue', 'Play after current song']
                    },
                    {
                        functions: [() => {}, () => {}],
                        icons: [<EditRounded/>, <DriveFileMoveRounded/>],
                        texts: ['Edit tags', 'Move to a folder']
                    },
                    {
                        functions: [() => {}, () => {}],
                        icons: [<InfoOutlineRounded/>, <DeleteRounded/>],
                        texts: ['Song info', 'Delete permanently']
                    }
                ]}
                parentRef={sectionRef}
            />
            <Toaster
                toasterId='folders'
                position='bottom-right'
                containerStyle={{
                    position: 'absolute',
                    fontSize: '.8rem'
                }}
            />
        </COL>
    )
}