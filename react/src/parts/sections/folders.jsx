import { useEffect, useState } from 'react';
import { COL, ROW, GRID, SearchBox } from '../../util/components';

import { parseTime } from '../../util/functions';

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
    MoreHorizRounded
    
} from '@mui/icons-material';

export default function folders()
{
    const
        [showInside, setShowInside] = useState(false),
        [folderPaths, setFolderPaths] = useState([]),
        [selectedFolders, setSelectedFolders] = useState(),
        [deleteSelected, setDeleteSelected] = useState(false),
        [folderName, setFolderName] = useState(),
        [songsData, setSongsData] = useState(),
        [folderDuration, setFoldarDuration] = useState(),
        [inputSearchSpace, setInputSearchSpace] = useState(),
        [inputMatchSpace, setInputMatchSpace] = useState();
    
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

    function Songs()
    {
        const components = [];
    
        let totalDuration = 0;

        songsData?.forEach(({title, artist, album, duration}, i) =>
        {
            totalDuration += duration;
    
            const
                { minutes, seconds } = parseTime(duration),
                durationText = `${minutes}:${seconds}`;
    
            components.push(
                <li key={i} className={`${inputMatchSpace?.[i] ? '' : 'displayNone'}`}>
                    <COL className='songData'>
                        <span className='title overflowPrevent'>{title}</span>
                        <span className='artist overflowPrevent'>{artist}</span>
                        <ROW>
                            <span className='album overflowPrevent'>{album}</span>
                            <span className='duration'>{durationText}</span>
                        </ROW>
                    </COL>
                    <button><MoreHorizRounded/></button>
                </li>
            );
        });
        
        return components;
    }

    useEffect(() =>
    {
        window.ipc.invoke('ipc-wantFolders').then((folderData) =>
        {
            setFolderPaths(folderData);
            setSelectedFolders([...folderData].map(x => false));
        });
    }, []);

    return (
        <COL className='section' id='folders'>
            <COL className={`out ${showInside ? 'displayNone' : ''}`}>
                <ul className='folders'>
                    <FolderList/>
                </ul>
                <ul className='folderOptions'>
                    <li className='folderOption' onClick={() => window.ipc.invoke('ipc-addFolders').then(x => setFolderPaths(x))}>
                        <CreateNewFolderRounded/>
                        <span>Add folders</span>
                    </li>
                    <li className={`folderOption ${deleteSelected ? 'selected' : ''}`} onClick={handleDeleteClick}>
                        <RemoveCircleOutlineRounded/>
                        <DeleteText/>
                    </li>
                    <li className='folderOption'>
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
                <ul className='songList'>
                    <Songs/>
                </ul>
            </COL>
        </COL>
    )
}