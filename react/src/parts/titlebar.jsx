import { useEffect, useState } from 'react';

import { RemoveRounded, CropSquareRounded, CloseRounded } from '@mui/icons-material';

import eventBus from '../util/events';
import { GRID } from '../util/components';

export default function titlebar()
{
    let currentTime = 0;

    function exitApp()
    {
        window.ipc.send('ipc-close', {currentTime});
    }

    useEffect(() =>
    {
        eventBus.addEventListener('ot-currentTime', ({detail}) => currentTime = detail);
    }, []);

    return (
        <GRID id='titlebar'>
            <span>OverTone</span>
            <button className='minimize' onClick={() => window.ipc.send('ipc-minimize')}><RemoveRounded/></button>
            <button className='maximize' onClick={() => window.ipc.send('ipc-maximize')}><CropSquareRounded/></button>
            <button className='close' onClick={exitApp}><CloseRounded/></button>
        </GRID>
    )
}