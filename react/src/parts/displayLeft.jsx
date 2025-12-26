import { useEffect, useRef } from 'react';
import { COL, ROW } from '../util/components';

import eventBus from '../util/events';

// import Queue from './sections/queue';
import Folders from './sections/folders';
// import Albums from './sections/albums';
// import Artists from './sections/artists';
// import Genres from './sections/genres';
// import EQ from './sections/eq';
// import Settings from './sections/settings';

export default function displayRight()
{
    const displayRef = useRef();

    useEffect(() =>
    {
        const element = displayRef.current;

        function scroll({detail: index})
        {
            // should give width of all sections, but only gives visible part, so it works
            const visibleWidth = element.getBoundingClientRect().width;

            displayRef.current.scrollTo({left: index * visibleWidth, behavior: 'smooth'});
        }

        element.addEventListener('wheel', e => e.preventDefault(), {passive: false});
        eventBus.addEventListener('ot-navChange', scroll);

        return () =>
        {
            element.removeEventListener('wheel', e => e.preventDefault(), {passive: false});
            eventBus.removeEventListener('ot-navChange', scroll);
        }
    }, []);

    return (
        <ROW ref={displayRef} id='displayLeft'>
            <COL className='section' style={{background: 'brown'}}></COL>
            <Folders/>
            <COL className='section' style={{background: 'cyan'}}></COL>
            <COL className='section' style={{background: 'orange'}}></COL>
            <COL className='section' style={{background: 'black'}}></COL>
            <COL className='section' style={{background: 'pink'}}></COL>
            <COL className='section' style={{background: 'purple'}}></COL>
            {/* <Queue/>
            <Albums/>
            <Artists/>
            <Genres/>
            <EQ/>
            <Settings/> */}
        </ROW>
    )
}