import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { COL, ROW, GRID, SearchBox, ContextMenu, SongInfoModal, DeleteModal, AddToQueueModal, CustomModal } from '../../util/components';
import { parseTime } from '../../util/functions';
import eventBus from '../../util/events';

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
    EditRounded,
    FavoriteRounded,
    CheckBoxRounded,
    CheckBoxOutlineBlankRounded,
    SelectAllRounded,
    DeselectRounded
} from '@mui/icons-material';

export default function folders()
{
    const sectionRef = useRef();
    const toastRef = useRef('');

    const
        [showProgressModal, setShowProgressModal] = useState(false),
        [updateProgress, setUpdateProgress] = useState(0),
        [showInside, setShowInside] = useState(false),
        [folderPaths, setFolderPaths] = useState([]),
        [selectedFolders, setSelectedFolders] = useState(),
        [deleteSelected, setDeleteSelected] = useState(false),
        [folderName, setFolderName] = useState(),
        [currentFolderPath, setCurrentFolderPath] = useState(),
        [songsData, setSongsData] = useState(),
        [folderDuration, setFoldarDuration] = useState(),
        [inputSearchSpace, setInputSearchSpace] = useState(),
        [inputMatchSpace, setInputMatchSpace] = useState(),
        [showContextMenu, setShowContextMenu] = useState(false),
        [contextData, setContextData] = useState({}),
        [showAddToQueueModal, setShowAddToQueueModal] = useState(false),
        [showEditTagsModal, setShowEditTagsModal] = useState(false),
        [showSongInfoModal, setShowSongInfoModal] = useState(false),
        [showDeleteModal, setShowDeleteModal] = useState(false),
        [selectedFiles, setSelectedFiles] = useState([]),
        [multiSelect, setMultiSelect] = useState(false);
    
    function handleFolderClick({target})
    {
        const { index, type } = target.dataset;

        if (type !== undefined)
        {
            if (type === 'favorites')
            {
                setCurrentFolderPath(undefined);
                setFolderName('Favorites');
            }
            
            window.ipc.invoke('ipc-wantFolder', type).then((songData) =>
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

        else if (index !== undefined)
        {
            if (deleteSelected)
            {
                const temp = [...selectedFolders];
                temp[index] = !temp[index];
                
                setSelectedFolders(temp);
            }
    
            else
            {
                const folder = folderPaths[index];
    
                setCurrentFolderPath(folder);
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
                <ROW className={`folder ${selectedFolders?.[i] ? 'delete' : ''}`} onClick={handleFolderClick} key={i} data-index={i}>
                    <FolderRounded/>
                    <COL>
                        <span className='name'>{folderName}</span>
                        <span className='path'>{folderPath}</span>
                    </COL>
                    <button className='deleteButton'><DeleteRounded/></button>
                </ROW>
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

    function selectItems(filepath, force)
    {
        if (force) return setSelectedFiles([filepath]);

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
            selectItems(data.location, true);
            setContextData({title: data.title, filepath: data.location});
        }
        
        setShowContextMenu(true);
    }

    function Songs()
    {
        function click(index)
        {
            window.ipc.send('ipc-addQueue', { trackNumber: index, songLocations: songsData.map(x => x.location), queueName: folderName });
            eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 0}));
        }

        let totalDuration = 0;

        return songsData?.map(({title, artist, album, duration, location}, i) =>
        {
            totalDuration += duration;
    
            return (
                <ROW key={i} className={`${multiSelect ? 'selectable' : null} ${inputMatchSpace?.[i] ? null : 'displayNone'}`} onContextMenu={() => openContext({title, location})}>
                    <button className='select' onClick={() => selectItems(location)}>{selectedFiles?.includes(location) ? <CheckBoxRounded/> : <CheckBoxOutlineBlankRounded/>}</button>
                    <COL className='songData' onClick={() => multiSelect ? null : click(i)}>
                        <span className='title overflowPrevent'>{title}</span>
                        <span className='artist overflowPrevent'>{artist}</span>
                        <ROW>
                            <span className='album overflowPrevent'>{album}</span>
                            <span className='duration'>{parseTime(duration).text}</span>
                        </ROW>
                    </COL>
                    <button onClick={() => openContext({title, location})}><MoreHorizRounded/></button>
                </ROW>
            );
        });
    }

    useEffect(() => setSelectedFiles([]), [multiSelect]);

    useEffect(() => 
    {
        if (showInside) return;

        window.ipc.invoke('ipc-wantFolders').then((folderData) =>
        {
            setFolderPaths(folderData);
            setSelectedFolders([...folderData].map(x => false));
        });

    }, [showInside]);

    useEffect(() =>
    {
        if (updateProgress >= 100)
        {
            eventBus.dispatchEvent(new Event('ot-refresh'));

            setTimeout(() => setShowProgressModal(false), 1000);
            setTimeout(() => setUpdateProgress(0), 2000);
        }

    }, [updateProgress]);

    useEffect(() =>
    {
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

        window.ipc.on('ipc-foldersToast', ({type, text}) =>
        {
            setMultiSelect(false);

            if (type) toast[type](text, {toasterId: 'folders'});
            else toast(text, {toasterId: 'folders'});            
        });

        window.ipc.on('ipc-updateLibraryProgress', setUpdateProgress);

        eventBus.addEventListener('ot-navChange', () => setSelectedFiles([]));
    }, []);

    return (
        <COL ref={sectionRef} className='section relative' id='folders'>
            <COL className={`out ${showInside ? null : 'show'}`}>
                <COL className='folders'>
                    <FolderList/>
                </COL>
                <COL className='extras'>
                    <ROW data-type={'favorites'} onClick={handleFolderClick}>
                        <FavoriteRounded/>
                        <span className='name'>Favorites</span>
                    </ROW>
                    {/* <li onClick={handleFolderClick}>
                        <DeleteRounded/>
                        <span className='name'>Placeholder</span>
                    </li> */}
                </COL>
                <COL className='folderOptions'>
                    <ROW className='folderOption' onClick={() => { toastRef.current = toast.loading('Scanning ...', {toasterId: 'folders'}); window.ipc.send('ipc-addFolders'); setShowProgressModal(true); }}>
                        <CreateNewFolderRounded/>
                        <span>Add folders</span>
                    </ROW>
                    <ROW className={`folderOption ${deleteSelected ? 'selected' : ''}`} onClick={handleDeleteClick}>
                        <RemoveCircleOutlineRounded/>
                        <DeleteText/>
                    </ROW>
                    <ROW className='folderOption' onClick={() => { toastRef.current = toast.loading('Scanning ...', {toasterId: 'folders'}); window.ipc.send('ipc-updateFiles'); setShowProgressModal(true); }}>
                        <SyncRounded/>
                        <span>Sync files</span>
                    </ROW>
                </COL>
            </COL>
            <COL className={`in ${showInside ? 'show' : null}`}>
                <ROW className='head'>
                    <button onClick={() => setShowInside(false)}><ChevronLeftRounded/></button>
                    <COL>
                        <span className='name'>{folderName}</span>
                        <span className='path'>{currentFolderPath}</span>
                    </COL>
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
                    <button onClick={() => setMultiSelect(x => !x)} className={multiSelect ? 'focus' : null}>{multiSelect ? <DeselectRounded/> : <SelectAllRounded/>}</button>
                </GRID>
                <COL className='songList'><Songs/></COL>
            </COL>
            <CustomModal visibility={[showProgressModal]} parentRef={sectionRef}>
                <COL className={'progressModal'}>
                    <CircularProgressbar value={updateProgress} strokeWidth={5} text={`${updateProgress.toString().split('.')[0]}%`}/>
                    <span>Do not close the app, until the progress completes</span>
                    <span>If progress seems to be stuck for more than a minute, restart the app</span>
                </COL>
            </CustomModal>
            <AddToQueueModal
                visibility={[showAddToQueueModal, setShowAddToQueueModal]}
                parentRef={sectionRef}
                files={selectedFiles}
                toasterId={'folders'}
            />
            <SongInfoModal
                visibility={[showEditTagsModal, setShowEditTagsModal]}
                parentRef={sectionRef}
                file={selectedFiles[0]}
                edit={true}
                toastEvent={'ipc-foldersToast'}
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
                toasterId={'folders'}
            />
            <ContextMenu
                visibility={[showContextMenu, setShowContextMenu]}
                title={contextData?.title}
                options={
                    multiSelect ? [
                        {
                            functions: [
                                () => setShowAddToQueueModal(true),
                                () => {
                                    window.ipc.invoke('ipc-upcomingSongs', {files: selectedFiles}).then((success) =>
                                    {
                                        if (success) toast.success(`Selected ${selectedFiles?.length} ${selectedFiles?.length > 1 ? 'songs' : 'song'} will play next`, {toasterId: 'folders'});
                                        else toast.error(`Error adding the selected ${selectedFiles?.length > 1 ? 'songs' : 'song'} to play next`, {toasterId: 'folders'});
                                    });
                                }
                            ],
                            icons: [<PlaylistAddRounded/>, <StartRounded/>],
                            texts: ['Add to a queue', 'Play after current song']
                        },
                        {
                            functions: [() => { window.ipc.send('ipc-moveToFolder', {files: selectedFiles, toastEvent: 'ipc-foldersToast'}); setMultiSelect(false); }],
                            icons: [<DriveFileMoveRounded/>],
                            texts: ['Move to a folder']
                        },
                        {
                            functions: [() => setShowDeleteModal(true)],
                            icons: [<DeleteRounded/>],
                            texts: ['Delete permanently']
                        }
                    ] : [
                        {
                            functions: [
                                () => setShowAddToQueueModal(true),
                                () => {
                                    window.ipc.invoke('ipc-upcomingSongs', {files: selectedFiles}).then((success) =>
                                    {
                                        if (success) toast.success('Selected song will play next', {toasterId: 'folders'});
                                        else toast.error('Error adding the selected song to play next', {toasterId: 'folders'});
                                    });
                                }
                            ],
                            icons: [<PlaylistAddRounded/>, <StartRounded/>],
                            texts: ['Add to a queue', 'Play after current song']
                        },
                        {
                            functions: [() => {}, () => window.ipc.send('ipc-moveToFolder', {files: selectedFiles, toastEvent: 'ipc-foldersToast'})],
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
                    ]
                }
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