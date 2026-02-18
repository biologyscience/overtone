import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

import { COL, ROW, CustomDropdown, ColorPicker, CustomModal } from '../../../util/components';

import { OpenInNewRounded } from '@mui/icons-material';

export default function Colors()
{
    const
        root = useRef(),
        parentRef = useRef();

    const
        [currentDynamicColor, setCurrentDyanmicColor] = useState({}),
        [dynamic, setDynamic] = useState(),
        [theme, setTheme] = useState(),
        [themes, setThemes] = useState(),
        colorState = { background: useState(), accent: useState(), accent1: useState(), text: useState('#FFFFFF') },
        [showModal, setShowModal] = useState(false),
        [themeName, setThemeName] = useState(''),
        [highContrast, setHighContrast] = useState();

    function toHex(rgb) { return '#' + rgb.map(number => number.toString(16).padStart(2, '0')).join('').toUpperCase() };

    function setHighContrastColors(currentTheme)
    {
        if (!root.current) return;

        if (currentTheme === 'Light')
        {
            colorState.background[1]('#F9FAFB');
            colorState.accent[1]('#2563EB');
            colorState.accent1[1]('#2563EB25');
            colorState.text[1]('#111827');
            setTheme('Light');
        }

        else
        {
            colorState.background[1]('#000000');
            colorState.accent[1]('#22C55E');
            colorState.accent1[1]('#22C55E25');
            colorState.text[1]('#FFFFFF');
            setTheme('Dark');
        }
    }

    function setDynamicColors(colors, currentTheme)
    {
        if (!root.current || !colors?.DarkMuted) return;

        if (currentTheme === 'Light')
        {
            colorState.background[1](toHex(colors.LightMuted));
            colorState.accent[1](toHex(colors.DarkVibrant));
            colorState.accent1[1](toHex(colors.DarkVibrant));
            colorState.text[1]('#000000');
            setTheme('Light');
        }

        else
        {
            colorState.background[1](toHex(colors.DarkMuted));
            colorState.accent[1](toHex(colors.LightVibrant));
            colorState.accent1[1](toHex(colors.LightVibrant));
            colorState.text[1]('#FFFFFF');
            setTheme('Dark');
        }
    }

    function saveTheme(name, colors)
    {
        setThemes(x => { x.push(name); return x; });
        setTheme(name);

        toast.success('Theme saved successfully', {toasterId: 'settings'});

        setShowModal(false);

        window.ipc.send('ipc-saveColorTheme', ({name, colors}));
    }

    //

    useEffect(() =>
    {
        window.ipc.send('ipc-updateConfig', ({value: dynamic, keys: ['colors', 'dynamic']}));

        if (!dynamic) return;

        setDynamicColors(structuredClone(currentDynamicColor), theme);

        setHighContrast(false);

    }, [dynamic]);

    useEffect(() =>
    {
        if (!['Dark', 'Light'].includes(theme))
        {
            setDynamic(false);
            setHighContrast(false);

            window.ipc.invoke('ipc-wantThemeColors', theme).then((colors) =>
            {
                if (colors === undefined) return;

                colorState.background[1](colors[0]);
                colorState.accent[1](colors[1]);
                colorState.accent1[1](colors[2]);
                colorState.text[1](colors[3]);
            });
        }

        else if (highContrast) setHighContrastColors(theme);

        else
        {
            setDynamic(true);
            setDynamicColors(structuredClone(currentDynamicColor), theme);
        }

        window.ipc.send('ipc-updateConfig', ({value: theme, keys: ['colors', 'theme']}));

    }, [theme]);

    useEffect(() =>
    {
        if (!root.current) return;

        root.current.style.setProperty('--background', colorState.background[0]);
        root.current.style.setProperty('--accent', colorState.accent[0]);
        root.current.style.setProperty('--accent2', colorState.accent1[0] + '25');
        root.current.style.setProperty('--textColor', colorState.text[0]);

    }, [colorState.background[0], colorState.accent[0], colorState.accent1[0], colorState.text[0]]);
    
    useEffect(() =>
    {
        window.ipc.send('ipc-updateConfig', ({value: highContrast, keys: ['colors', 'highContrast']}));

        if (!highContrast) return;

        setHighContrastColors(theme);
        if (theme !== 'Light') setTheme('Dark');

        setDynamic(false);

    }, [highContrast]);

    useEffect(() =>
    {
        if (!dynamic) return;

        setDynamicColors(structuredClone(currentDynamicColor), theme);

    }, [currentDynamicColor]);

    useEffect(() =>
    {
        if (showModal) return;

        setThemeName('');

    }, [showModal]);
    
    useEffect(() =>
    {
        root.current = document.querySelector(':root');

        window.ipc.on('ipc-setNowPlaying', ({colors}) => setCurrentDyanmicColor(colors));

        window.ipc.on('ipc-takeConfig', ({colors}) =>
        {
            setDynamic(colors.dynamic);
            setThemes(['Dark', 'Light', ...Object.keys(colors.themes)]);
            setTheme(colors.theme);
            setHighContrast(colors.highContrast);
        });
    }, []);

    return (
        <COL ref={parentRef} className={'view'}>
            <ROW className={'option'}>
                <span>Dynamic colors</span>
                <input type='checkbox' className='switch' checked={dynamic} onChange={() => setDynamic(x => !x)}/>
            </ROW>
            <ROW className={'option'}>
                <span>Color theme</span>
                <CustomDropdown
                    options={themes}
                    select={[theme, setTheme]}
                />
            </ROW>
            <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Background color</span>
                <ColorPicker colorState={colorState.background}/>
            </ROW>
            <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Primary accent color</span>
                <ColorPicker colorState={colorState.accent}/>
            </ROW>
            <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Secondary accent color (at 25% transparency)</span>
                <ColorPicker colorState={colorState.accent1}/>
            </ROW>
            {/* <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Text color</span>
                <ColorPicker colorState={colorState.text}/>
            </ROW> */}
            <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Save colors as a theme</span>
                <button className='popup' onClick={() => setShowModal(true)}><OpenInNewRounded/></button>
            </ROW>
            <ROW className={'option'}>
                <span>Enable high contrast mode</span>
                <input type='checkbox' className='switch' checked={highContrast} onChange={() => setHighContrast(x => !x)}/>
            </ROW>
            <ROW className={'option'}>
                <span>Restore to default color config</span>
                <button className='popup' onClick={() => { setTheme('Dark'); setDynamic(true); }}><OpenInNewRounded/></button>
            </ROW>
            <CustomModal parentRef={parentRef} visibility={[showModal, setShowModal]}>
                <COL className={'saveThemeModal'}>
                    <span className='title'>You are about to save the colors displayed currently as a theme</span>
                    <span>Name your theme to proceed</span>
                    <input placeholder='Your theme name' value={themeName} onChange={({target}) => setThemeName(target.value)}/>
                    <ROW className={'buttons'}>
                        <button onClick={() => saveTheme(themeName, [colorState.background[0], colorState.accent[0], colorState.accent1[0], colorState.text[0]])}>Save</button>
                        <button onClick={() => setShowModal(false)}>Cancel</button>
                    </ROW>
                </COL>
            </CustomModal>
        </COL>
    )
}