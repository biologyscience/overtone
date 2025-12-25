import { GRID } from '../util/components';

import { RemoveRounded, CropSquareRounded, CloseRounded } from '@mui/icons-material';

export default function titlebar()
{
    return (
        <GRID id='titlebar'>
            <span>OverTone</span>
            <button className='minimize' onClick={() => window.ipc.send('ipc-minimize')}><RemoveRounded/></button>
            <button className='maximize' onClick={() => window.ipc.send('ipc-maximize')}><CropSquareRounded/></button>
            <button className='close' onClick={() => window.ipc.send('ipc-close')}><CloseRounded/></button>
        </GRID>
    )
}