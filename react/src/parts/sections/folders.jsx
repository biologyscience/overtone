import { useEffect, useRef, useState } from 'react';
import { COL, ROW } from '../../util/components';

import
{
    FolderRounded,
    DeleteRounded,
    SyncRounded,
    CreateNewFolderRounded,
    RemoveCircleOutlineRounded
    
} from '@mui/icons-material';

export default function folders()
{
    const
        [showInside, setShowInside] = useState(false),
        [folderPaths, setFolderPaths] = useState([]),
        [selectedFolders, setSelectedFolders] = useState(),
        [deleteSelected, setDeleteSelected] = useState(false);
    
    function handleFolderClick({target})
    {
        if (deleteSelected)
        {
            const { index } = target.dataset;

            const temp = [...selectedFolders];
            temp[index] = !temp[index];
            
            setSelectedFolders(temp);
        }

        else
        {
            // set Inside Data
            // setShowInside(true);
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
            const temp = [...folderData].map(x => false);
            setSelectedFolders(temp);
            setFolderPaths(folderData);
        });
    }, []);

    return (
        <COL className='section' id='folders'>
            <COL className={`out ${showInside ? 'displayNone' : ''}`}>
                <ul className='folders'>
                    <FolderList/>
                </ul>
                <ul className='folderOptions'>
                    <li className='folderOption'>
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
                hello
            </COL>
        </COL>
    )
}

/**

                <div class="in inheritHeight flexCol displayNone">
                    <div class="head flex">
                        <img src="svg/chevronLeft.svg" id="backIcon">
                        <span id="folderName">empty</span>
                    </div>
                    <div class="body grid relative">
                        <div class="flex">
                            <img src="svg/hash.svg">
                            <span id="songCount" class="marginLeft">empty</span>
                        </div>
                        <div class="flex">
                            <img src="svg/timer.svg">
                            <span id="totalDurationOfSongs" class="marginLeft"></span>
                        </div>
                        <div class="searchBar grid">
                            <img src="svg/search.svg">
                            <input type="text" id="folderInput" class="marginLeft" placeholder="Search in this list">
                        </div>
                    </div>
                    <ul id="songListInFolder"></ul>
                </div>

 */