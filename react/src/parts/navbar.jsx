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

export default function Navbar()
{
    const [left, setLeft] = useState(0);
    const [index, setIndex] = useState(2);
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

        [...navRef.current.children[0].children].forEach((x, i) =>
        {
            x.classList.remove('current');

            if (i === index) x.classList.add('current');
        });
    }, [index]);

    useEffect(() =>
    {
        window.addEventListener('resize', handleResize);
        eventBus.addEventListener('ot-changeSectionTo', ({detail}) => setIndex(detail));

        return () =>
        {
            window.removeEventListener('resize', handleResize);
            eventBus.removeEventListener('ot-changeSectionTo', ({detail}) => setIndex(detail));
        }
    }, []);

    return (
        <nav id='nav' ref={navRef} style={{'--left': `${left}px`}}>
            <ul>
                <li data-index={0} onClick={handleClick}><QueueMusicRounded/></li>
                <li data-index={1} onClick={handleClick}><FolderRounded/></li>
                <li data-index={2} onClick={handleClick}><AlbumRounded/></li>
                <li data-index={3} onClick={handleClick}><PersonRounded/></li>
                <li data-index={4} onClick={handleClick}><GraphicEqRounded/></li>
                <li data-index={5} onClick={handleClick}><SettingsRounded/></li>
            </ul>
        </nav>
    );
}