import { useState } from 'react';
import { OpenInNewRounded } from '@mui/icons-material';

import { COL, ROW, CustomDropdown } from '../../../util/components';

export default function Interface()
{
    const
        [select, setSelect] = useState();

    return (
        <COL className={'view'}>
            <ROW className={'option'}>
                <span>Font</span>
                <input type='checkbox' className='switch'/>
            </ROW>
            <ROW className={'option'}>
                <span>Text Size</span>
                <CustomDropdown
                    options={['Small', 'Medium', 'Large']}
                    defaultOptionIndex={1}
                    select={[select, setSelect]}
                />
            </ROW>
            <ROW className={'option'}>
                <span>Allow animations</span>
                <input type='checkbox' className='switch'/>
            </ROW>
            <ROW className={'option'}>
                <span>App Icon</span>
                <button className='popup'><OpenInNewRounded/></button>
            </ROW>
            <ROW className={'option'}>
                <span>Keyboard Shortcuts</span>
                <button className='popup'><OpenInNewRounded/></button>
            </ROW>
        </COL>
    )
}