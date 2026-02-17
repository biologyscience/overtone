import { useEffect, useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

import Colors from './settings/colors';
import Audio from './settings/audio';
import Interface from './settings/interface';
import Advanced from './settings/advanced';

import { COL, ROW } from '../../util/components';

export default function Settings()
{
    const vertical = true;

    const settingsRef = useRef();

    const [index, setIndex] = useState(0);

    function selectCategory({target})
    {
        const element = settingsRef.current.querySelector('.views');

        const int = parseInt(target.dataset.index);

        const boundingRect = element.getBoundingClientRect();

        if (vertical)
        {
            element.scrollTo({top: int * (element.scrollHeight - boundingRect.height) / 3, behavior: 'smooth'});
        }

        else
        {
            element.scrollTo({left: int * boundingRect.width, behavior: 'smooth'});
            setIndex(int);
        }
    }

    useEffect(() =>
    {
        function preventXScroll(E) { if (E.shiftKey || E.deltaX !== 0) return E.preventDefault(); }

        selectCategory({target: { dataset: { index } }});

        const element = settingsRef.current.querySelector('.views');

        element.addEventListener('wheel', preventXScroll, {passive: false});
        element.addEventListener('scroll', (E) =>
        {
            if (!vertical) return;

            const { scrollTop, scrollHeight, clientHeight } = E.target;

            const int = Math.round(scrollTop * 3 / (scrollHeight - clientHeight));

            setIndex(int);
        });

    }, []);

    return (
        <COL ref={settingsRef} className={`section relative ${vertical ? 'vertical' : 'horizontal'}`} id='settings'>
            <span className={'title'}>Settings</span>
            {
                vertical ? (
                    <ROW className={'content'}>
                        <COL className={'categories'}>
                            <span data-index={0} className={`category ${index === 0 ? 'current' : ''}`} onClick={selectCategory}>Colors & Theme</span>
                            <span data-index={1} className={`category ${index === 1 ? 'current' : ''}`} onClick={selectCategory}>Audio</span>
                            <span data-index={2} className={`category ${index === 2 ? 'current' : ''}`} onClick={selectCategory}>Interface</span>
                            <span data-index={3} className={`category ${index === 3 ? 'current' : ''}`} onClick={selectCategory}>Advanced</span>
                        </COL>
                        <COL className={'views'}>
                            <Colors/>
                            <div className='divider'/>
                            <Audio/>
                            <div className='divider'/>
                            <Interface/>
                            <div className='divider'/>
                            <Advanced/>
                        </COL>
                    </ROW>
                ) : (
                    <>
                    <ROW className={'categories'}>
                        <span data-index={0} className={`category ${index === 0 ? 'current' : ''}`} onClick={selectCategory}>Colors & Theme</span>
                        <span data-index={1} className={`category ${index === 1 ? 'current' : ''}`} onClick={selectCategory}>Audio</span>
                        <span data-index={2} className={`category ${index === 2 ? 'current' : ''}`} onClick={selectCategory}>Interface</span>
                        <span data-index={3} className={`category ${index === 3 ? 'current' : ''}`} onClick={selectCategory}>Advanced</span>
                    </ROW>
                    <ROW className={'views'}>
                        <Colors/>
                        <Audio/>
                        <Interface/>
                        <Advanced/>
                    </ROW>
                    </>
                )
            }
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