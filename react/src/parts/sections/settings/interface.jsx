import { useEffect, useState, useRef } from 'react';
import { OpenInNewRounded } from '@mui/icons-material';

import { COL, ROW, CustomModal, CustomDropdown } from '../../../util/components';

export default function Interface()
{
    const defaultFont = 'Default (Fira Sans)';

    const
        root = useRef(),
        parentRef = useRef();

    const
        [fonts, setFonts] = useState(),
        [selectedFont, setSelectedFont] = useState(),
        [fontSize, setFontSize] = useState(),
        [allowAnimations, setAllowAnimations] = useState(),
        [showModal, setShowModal] = useState();

    useEffect(() =>
    {
        if (!root.current) return;

        let fontName;

        if (selectedFont === defaultFont) fontName = 'Fira';
        else fontName = selectedFont;

        root.current.style.setProperty('--currentFont', fontName);
        
        window.ipc.send('ipc-updateConfig', {value: fontName, keys: ['interface', 'font']});

    }, [selectedFont]);

    useEffect(() =>
    {
        if (!root.current) return;

        if (fontSize === 'Small') root.current.style.setProperty('font-size', '12px');
        if (fontSize === 'Medium') root.current.style.setProperty('font-size', '16px');
        if (fontSize === 'Large') root.current.style.setProperty('font-size', '22px');

        window.ipc.send('ipc-updateConfig', {value: ['Small', 'Medium', 'Large'].indexOf(fontSize), keys: ['interface', 'scale']});

    }, [fontSize]);

    useEffect(() =>
    {
        if (allowAnimations) document.body.classList.remove('disableAnimations');
        else document.body.classList.add('disableAnimations');

        window.ipc.send('ipc-updateConfig', {value: allowAnimations, keys: ['interface', 'animations']});

    }, [allowAnimations]);

    useEffect(() =>
    {
        root.current = document.querySelector(':root');

        window.queryLocalFonts().then((fontsArray) =>
        {
            const unique = [...new Set(fontsArray.map(x => x.family).filter(y => y?.length > 0))];

            setSelectedFont(defaultFont);
            setFonts([defaultFont, ...unique]);
        });

        window.ipc.on('ipc-takeConfig', (config) =>
        {
            const { font, scale, animations } = config.interface;

            setSelectedFont(font);
            setFontSize(['Small', 'Medium', 'Large'][scale]);
            setAllowAnimations(animations);
        });
    }, []);

    return (
        <COL ref={parentRef} className={'view'}>
            <ROW className={'option'}>
                <span>Font</span>
                <CustomDropdown className={'fontSelect'} options={fonts} select={[selectedFont, setSelectedFont]}/>
            </ROW>
            <ROW className={'option'}>
                <span>Appearance scaling</span>
                <CustomDropdown className={'fontSizeSelect'} options={['Small', 'Medium', 'Large']} select={[fontSize, setFontSize]}/>
            </ROW>
            <ROW className={'option'}>
                <span>Allow animations</span>
                <input type='checkbox' className='switch' checked={allowAnimations} onChange={() => setAllowAnimations(x => !x)}/>
            </ROW>
            {/* <ROW className={'option'}>
                <span>App Icon</span>
                <button className='popup'><OpenInNewRounded/></button>
            </ROW> */}
            <ROW className={'option'}>
                <span>Keyboard Shortcuts</span>
                <button className='popup' onClick={() => setShowModal(true)}><OpenInNewRounded/></button>
            </ROW>
            <CustomModal parentRef={parentRef} visibility={[showModal, setShowModal]}>
                <COL className={'keyboardShortcuts'}>
                    TBD
                </COL>
            </CustomModal>
        </COL>
    )
}