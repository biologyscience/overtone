import { useState, useRef, useEffect } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { useClickOutside } from 'react-haiku';

import { COL, ROW, CustomDropdown } from '../../../util/components';

import { OpenInNewRounded } from '@mui/icons-material';

export default function Colors()
{
    const root = useRef();

    const
        [currentDynamicColor, setCurrentDyanmicColor] = useState({}),
        [dynamic, setDynamic] = useState(true),
        [theme, setTheme] = useState(),
        colorState = { background: useState(), accent: useState(), accent1: useState(), text: useState('#FFFFFF') },
        paletteState = { background: useState(false), accent: useState(false), accent1: useState(false), text: useState(false) },
        colorPickerRef = { background: useRef(), accent: useRef(), accent1: useRef(), text: useRef() },
        [highContrast, setHighContrast] = useState(false);

    useClickOutside(colorPickerRef.background, () => paletteState.background[1](false));
    useClickOutside(colorPickerRef.accent, () => paletteState.accent[1](false));
    useClickOutside(colorPickerRef.accent1, () => paletteState.accent1[1](false));
    useClickOutside(colorPickerRef.text, () => paletteState.text[1](false));

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
        }

        else
        {
            colorState.background[1]('#000000');
            colorState.accent[1]('#22C55E');
            colorState.accent1[1]('#22C55E25');
            colorState.text[1]('#FFFFFF');
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
        }

        if (currentTheme === 'Dark')
        {
            colorState.background[1](toHex(colors.DarkMuted));
            colorState.accent[1](toHex(colors.LightVibrant));
            colorState.accent1[1](toHex(colors.LightVibrant));
            colorState.text[1]('#FFFFFF');
        }
    }

    //

    useEffect(() =>
    {
        if (!dynamic) return;

        setDynamicColors(structuredClone(currentDynamicColor), theme);

        setHighContrast(false);

    }, [dynamic]);

    useEffect(() =>
    {
        if (highContrast)
        {
            setHighContrastColors(theme);

            if (theme !== 'Light') setTheme('Dark');
        }

        if (dynamic) setDynamicColors(structuredClone(currentDynamicColor), theme);

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
        root.current = document.querySelector(':root');

        window.ipc.on('ipc-setNowPlaying', ({colors}) => setCurrentDyanmicColor(colors));
    }, []);

    return (
        <COL className={'view'}>
            <ROW className={'option'}>
                <span>Dynamic colors</span>
                <input type='checkbox' className='switch' checked={dynamic} onChange={() => setDynamic(x => !x)}/>
            </ROW>
            <ROW className={'option'}>
                <span>Select theme</span>
                <CustomDropdown
                    options={['Dark', 'Light', 'Some other']}
                    defaultOptionIndex={0}
                    select={[theme, setTheme]}
                />
            </ROW>
            <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Background color</span>
                <ROW ref={colorPickerRef.background} className={'colorPicker'}>
                    <div className='color'/>
                    <HexColorInput prefixed color={colorState.background[0]} onChange={colorState.background[1]} onClick={() => paletteState.background[1](true)}/>
                    <div className={`picker ${paletteState.background[0] ? null : 'displayNone'}`}><HexColorPicker color={colorState.background[0]} onChange={colorState.background[1]}/></div>
                </ROW>
            </ROW>
            <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Primary accent color</span>
                <ROW ref={colorPickerRef.accent} className={'colorPicker'}>
                    <div className='color'/>
                    <HexColorInput prefixed color={colorState.accent[0]} onChange={colorState.accent[1]} onClick={() => paletteState.accent[1](true)}/>
                    <div className={`picker ${paletteState.accent[0] ? null : 'displayNone'}`}><HexColorPicker color={colorState.accent[0]} onChange={colorState.accent[1]}/></div>
                </ROW>
            </ROW>
            <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Secondary accent color (at 25% transparency)</span>
                <ROW ref={colorPickerRef.accent1} className={'colorPicker'}>
                    <div className='color'/>
                    <HexColorInput prefixed color={colorState.accent1[0]} onChange={colorState.accent1[1]} onClick={() => paletteState.accent1[1](true)}/>
                    <div className={`picker ${paletteState.accent1[0] ? null : 'displayNone'}`}><HexColorPicker color={colorState.accent1[0]} onChange={colorState.accent1[1]}/></div>
                </ROW>
            </ROW>
            {/* <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Text color</span>
                <ROW ref={colorPickerRef.text} className={'colorPicker'}>
                    <div className='color'/>
                    <HexColorInput prefixed color={colorState.text[0]} onChange={colorState.text[1]} onClick={() => paletteState.text[1](true)}/>
                    <div className={`picker ${paletteState.text[0] ? null : 'displayNone'}`}><HexColorPicker color={colorState.text[0]} onChange={colorState.text[1]}/></div>
                </ROW>
            </ROW> */}
            <ROW className={`option ${dynamic || highContrast ? 'disabled' : null}`}>
                <span>Save colors as a theme</span>
                <button className='popup'><OpenInNewRounded/></button>
            </ROW>
            <ROW className={'option'}>
                <span>Enable high contrast mode</span>
                <input type='checkbox' className='switch' checked={highContrast} onChange={() => setHighContrast(x => !x)}/>
            </ROW>
            <ROW className={'option'}>
                <span>Restore default colors</span>
                <button className='popup' onClick={() => { setTheme('Dark'); setDynamic(true); }}><OpenInNewRounded/></button>
            </ROW>
        </COL>
    )
}