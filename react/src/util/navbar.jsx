import { useEffect, useState, useRef } from 'react';

import
{
    QueueMusicRounded,
    FolderRounded,
    AlbumRounded,
    PersonRounded,
    SellRounded,
    GraphicEqRounded,
    SettingsRounded
} from '@mui/icons-material';

import eventBus from './events';

export default function Navbar()
{
    const [left, setLeft] = useState(0);
    const [index, setIndex] = useState(2);
    const [width, setWidth] = useState(0);
    const navRef = useRef();

    useEffect(() =>
    {
        const value = parseInt(getComputedStyle(navRef.current, ':after').width.slice(0, -2));
        setWidth(value);

        function handleResize() { setLeft(navRef.current.children[0].children[index].getBoundingClientRect().left - (value / 4)); }
        handleResize();

        [...navRef.current.children[0].children].forEach((x, i) =>
        {
            x.classList.remove('current');

            if (i === index) x.classList.add('current');
        });

        eventBus.dispatchEvent(new CustomEvent('ot-navChange', {detail: index}));

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [index]);

    function handleClick({target})
    {
        setIndex(parseInt(target.dataset.index));
        setLeft(target.getBoundingClientRect().left - (width / 4));
    }

    return (
        <nav id='nav' ref={navRef} style={{'--left': `${left}px`}}>
            <ul>
                <li data-index={0} onClick={handleClick}><QueueMusicRounded/></li>
                <li data-index={1} onClick={handleClick}><FolderRounded/></li>
                <li data-index={2} onClick={handleClick}><AlbumRounded/></li>
                <li data-index={3} onClick={handleClick}><PersonRounded/></li>
                <li data-index={4} onClick={handleClick}><SellRounded/></li>
                <li data-index={5} onClick={handleClick}><GraphicEqRounded/></li>
                <li data-index={6} onClick={handleClick}><SettingsRounded/></li>
            </ul>
        </nav>
    );
}