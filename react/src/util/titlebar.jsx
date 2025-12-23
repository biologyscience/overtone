import { GRID } from './components';

import { RemoveRounded, CropSquareRounded, CloseRounded } from '@mui/icons-material';

export default function titlebar()
{
    return (
        <GRID id='titlebar'>
            <span>OverTone</span>
            <button onClick={() => window.ipc.send('ipc-minimize')}><RemoveRounded/></button>
            <button onClick={() => window.ipc.send('ipc-maximize')}><CropSquareRounded/></button>
            <button onClick={() => window.ipc.send('ipc-close')}><CloseRounded/></button>
        </GRID>
    )
}