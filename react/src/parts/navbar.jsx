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
    const [index, setIndex] = useState(4);
    const [width, setWidth] = useState(0);
    const navRef = useRef();

    function handleResize()
    {
        const value = parseInt(getComputedStyle(navRef.current, ':after').width.slice(0, -2));

        setWidth(value);
        setLeft(navRef.current.children[0].children[index].getBoundingClientRect().left - (value / 4));
        
        eventBus.dispatchEvent(new CustomEvent('ot-navChange', {detail: index}));
    }

    function handleClick({target})
    {
        setIndex(parseInt(target.dataset.index));
        setLeft(target.getBoundingClientRect().left - (width / 4));
    }

    useEffect(() =>
    {
        handleResize();
        
    }, [index]);

    useEffect(() =>
    {
        window.addEventListener('resize', handleResize);
        eventBus.addEventListener('ot-changeSectionTo', ({detail}) => setIndex(detail));
    }, []);

    return (
        <nav id='nav' ref={navRef} style={{'--left': `${left}px`}}>
            <ROW className={'sections'}>
                <ROW data-index={0} className={`section ${index === 0 ? 'current' : ''}`} onClick={handleClick}><QueueMusicRounded/></ROW>
                <ROW data-index={1} className={`section ${index === 1 ? 'current' : ''}`} onClick={handleClick}><FolderRounded/></ROW>
                <ROW data-index={2} className={`section ${index === 2 ? 'current' : ''}`} onClick={handleClick}><AlbumRounded/></ROW>
                <ROW data-index={3} className={`section ${index === 3 ? 'current' : ''}`} onClick={handleClick}><PersonRounded/></ROW>
                <ROW data-index={4} className={`section ${index === 4 ? 'current' : ''}`} onClick={handleClick}><GraphicEqRounded/></ROW>
                <ROW data-index={5} className={`section ${index === 5 ? 'current' : ''}`} onClick={handleClick}><SettingsRounded/></ROW>
            </ROW>
        </nav>
    );
}