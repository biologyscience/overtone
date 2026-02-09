import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { COL, ROW, GRID } from '../../util/components';

import
{
    DeleteRounded,
    InfoOutlineRounded,
    PlaylistAddRounded,
    StartRounded,
    
} from '@mui/icons-material';

export default function albums()
{
    const sectionRef = useRef();

    const
        [index, setIndex] = useState(0);

    function selectCategory({target})
    {
        const element = sectionRef.current.querySelector('.views');

        const int = parseInt(target.dataset.index);

        const visibleWidth = element.getBoundingClientRect().width;

        element.scrollTo({left: int * visibleWidth, behavior: 'smooth'});

        setIndex(int);
    }

    useEffect(() =>
    {
        const element = sectionRef.current.querySelector('.views');

        function preventXScroll(E) { if (E.shiftKey || E.deltaX !== 0) return E.preventDefault(); }

        element.addEventListener('wheel', preventXScroll, {passive: false});
    }, []);

    return (
        <COL ref={sectionRef} className='section relative' id='settings'>
            <span className={'title'}>Settings</span>
            <ROW className={'categories'}>
                <span data-index={0} className={`category ${index === 0 ? 'current' : ''}`} onClick={selectCategory}>Colors</span>
                <span data-index={1} className={`category ${index === 1 ? 'current' : ''}`} onClick={selectCategory}>Audio</span>
                <span data-index={2} className={`category ${index === 2 ? 'current' : ''}`} onClick={selectCategory}>Interface</span>
                <span data-index={3} className={`category ${index === 3 ? 'current' : ''}`} onClick={selectCategory}>Discord RPC</span>
                <span data-index={4} className={`category ${index === 4 ? 'current' : ''}`} onClick={selectCategory}>Advanced</span>
            </ROW>
            <ROW className={'views'}>
                <COL className={'view'}>
                    <GRID className={'option'}>
                        <span>Option one</span>
                        <input type='checkbox' className='switch' onChange={console.log}/>
                    </GRID>
                    <GRID className={'option'}>
                        <span>Option ABC very long</span>
                        <input type='checkbox' className='switch' onChange={console.log}/>
                    </GRID>
                    <GRID className={'option'}>
                        <span>Option</span>
                        <input type='checkbox' className='switch' onChange={console.log}/>
                    </GRID>
                </COL>
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