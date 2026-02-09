import { useEffect, useRef } from 'react';

import { ROW } from '../util/components';
import eventBus from '../util/events';

import Queue from './sections/queues';
import Folders from './sections/folders';
import Albums from './sections/albums';
import Artists from './sections/artists';
import EQ from './sections/eq';
import Settings from './sections/settings';

export default function displayRight()
{
    const displayRef = useRef();

    useEffect(() =>
    {
        const element = displayRef.current;

        function scroll({detail})
        {
            // should give width of all sections, but only gives visible part, so it works
            const visibleWidth = element.getBoundingClientRect().width;

            displayRef.current.scrollTo({left: detail * visibleWidth, behavior: 'smooth'});

            if (detail === 0) eventBus.dispatchEvent(new Event('ot-focusSongInQueue'));
        }

        function preventXScroll(E) { if (E.shiftKey || E.deltaX !== 0) return E.preventDefault(); }

        element.addEventListener('wheel', preventXScroll, {passive: false});
        eventBus.addEventListener('ot-navChange', scroll);
    }, []);

    return (
        <ROW ref={displayRef} id='displayLeft'>
            <Queue/>
            <Folders/>
            <Albums/>
            <Artists/>
            <EQ/>
            <Settings/>
        </ROW>
    )
}