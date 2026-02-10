import { useEffect, useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

import Colors from './settings/colors';
import Audio from './settings/audio';
import Interface from './settings/interface';
import DiscordRPC from './settings/rpc';
import Advanced from './settings/advanced';

import { COL, ROW } from '../../util/components';

export default function Settings()
{
    const settingsRef = useRef();

    const [index, setIndex] = useState(1);

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
        function preventXScroll(E) { if (E.shiftKey || E.deltaX !== 0) return E.preventDefault(); }

        selectCategory({target: { dataset: { index } }});

        settingsRef.current.querySelector('.views').addEventListener('wheel', preventXScroll, {passive: false});
    }, []);
    
    return (
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
                <Colors/>
                <Audio/>
                <Interface/>
                <DiscordRPC/>
                <Advanced/>
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
    )
}