import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { COL, ROW } from '../util/components';
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
    const settingsRef = useRef();

    const [index, setIndex] = useState(0);

    function selectCategory({target})
    {
        const element = settingsRef.current.querySelector('.views');

        const int = parseInt(target.dataset.index);

        const visibleWidth = element.getBoundingClientRect().width;

        element.scrollTo({left: int * visibleWidth, behavior: 'smooth'});

        setIndex(int);
    }

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

        selectCategory({target: { dataset: { index } }});

        element.addEventListener('wheel', preventXScroll, {passive: false});
        settingsRef.current.querySelector('.views').addEventListener('wheel', preventXScroll, {passive: false});

        eventBus.addEventListener('ot-navChange', scroll);
    }, []);

    return (
        <ROW ref={displayRef} id='displayLeft'>
            <Queue/>
            <Folders/>
            <Albums/>
            <Artists/>
            <EQ/>
            <COL ref={settingsRef} className='section relative' id='settings'>
                <span className={'title'}>Settings</span>
                <ROW className={'categories'}>
                    <span data-index={0} className={`category ${index === 0 ? 'current' : ''}`} onClick={selectCategory}>Colors & Theme</span>
                    <span data-index={1} className={`category ${index === 1 ? 'current' : ''}`} onClick={selectCategory}>Audio</span>
                    <span data-index={2} className={`category ${index === 2 ? 'current' : ''}`} onClick={selectCategory}>Interface</span>
                    <span data-index={3} className={`category ${index === 3 ? 'current' : ''}`} onClick={selectCategory}>Discord RPC</span>
                    <span data-index={4} className={`category ${index === 4 ? 'current' : ''}`} onClick={selectCategory}>Advanced</span>
                </ROW>
                <ROW className={'views'}>
                    <Settings.Colors/>
                    <Settings.Audio/>
                    <Settings.Interface/>
                    <Settings.DiscordRPC/>
                    <Settings.Advanced/>
                </ROW>
                <Toaster
                    toasterId='settings'
                    position='bottom-right'
                    containerStyle={{
                        position: 'absolute',
                        fontSize: '.8rem'
                    }}
                />
            </COL>
        </ROW>
    )
}