import { useEffect, useState, useRef } from 'react';

import
{
    QueueMusicRounded,
    FolderRounded,
    AlbumRounded,
    PersonRounded,
    GraphicEqRounded,
    SettingsRounded
} from '@mui/icons-material';

import eventBus from '../util/events';
import { ROW } from '../util/components';

export default function Navbar()
{
    const [left, setLeft] = useState(0);
    const [index, setIndex] = useState(0);

    const navRef = useRef();
    const indexRef = useRef(index);

    function handleResize()
    {
        const tabWidth = parseInt(getComputedStyle(navRef.current, ':after').width.slice(0, -2));

        setLeft(navRef.current.children[0].children[indexRef.current].getBoundingClientRect().left - (tabWidth / 4));
        
        eventBus.dispatchEvent(new CustomEvent('ot-navChange', {detail: indexRef.current}));

        window.ipc.send('ipc-updateConfig', {value: indexRef.current, keys: ['lastSection']});
    }

    useEffect(() =>
    {
        indexRef.current = index;
        handleResize();

    }, [index]);

    useEffect(() =>
    {
        window.ipc.on('ipc-takeConfig', ({lastSection}) => setIndex(lastSection));
        window.addEventListener('resize', handleResize);
        eventBus.addEventListener('ot-changeSectionTo', ({detail}) => setIndex(detail));
    }, []);

    return (
        <nav id='nav' ref={navRef} style={{'--left': `${left}px`}}>
            <ROW className={'sections'}>
                <button className={`section ${index === 0 ? 'current' : ''}`} onClick={() => setIndex(0)}><QueueMusicRounded/></button>
                <button className={`section ${index === 1 ? 'current' : ''}`} onClick={() => setIndex(1)}><FolderRounded/></button>
                <button className={`section ${index === 2 ? 'current' : ''}`} onClick={() => setIndex(2)}><AlbumRounded/></button>
                <button className={`section ${index === 3 ? 'current' : ''}`} onClick={() => setIndex(3)}><PersonRounded/></button>
                <button className={`section ${index === 4 ? 'current' : ''}`} onClick={() => setIndex(4)}><GraphicEqRounded/></button>
                <button className={`section ${index === 5 ? 'current' : ''}`} onClick={() => setIndex(5)}><SettingsRounded/></button>
            </ROW>
        </nav>
    );
}