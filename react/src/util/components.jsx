import { useEffect, useRef, useState } from 'react';

import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import { CloseRounded } from '@mui/icons-material';

function ROW({ className, children, ...rest })
{
    return (
        <div className={className === undefined ? 'flexROW' : `flexROW ${className}`} {...rest}>
            {children}
        </div>
    )
}

function COL({ className, children, ...rest })
{
    return (
        <div className={className === undefined ? 'flexCOL' : `flexCOL ${className}`} {...rest}>
            {children}
        </div>
    )
}

function GRID({ className, children, ...rest })
{
    return (
        <div className={className === undefined ? 'grid' : `grid ${className}`} {...rest}>
            {children}
        </div>
    )
}

function Slider({ progressState: [progress, setProgress], setDragging, vertical, className, children, ...rest })
{
    let classtext = 'sliderWrapper';

    if (vertical) classtext += ' vertical';
    if (className !== undefined) classtext += ` ${className}`;

    const parentRef = useRef();
    const pressing = useRef(false);

    function mouseup()
    {
        pressing.current = false;

        if (setDragging !== undefined) setDragging(pressing.current);

        // change audio current time here
    }
    
    function mousemove({x, y})
    {
        if (pressing.current === false) return mouseup();

        const { top, bottom, left, right, width } = parentRef.current.getBoundingClientRect();

        if (x > right || x < left || y > bottom || y < top) return mouseup();

        const percent = 100 * (x - left) / width;

        setProgress(percent);
    }

    function mousedown(E)
    {
        pressing.current = true;

        if (setDragging !== undefined) setDragging(pressing.current);

        mousemove(E);
    }

    useEffect(() =>
    {
        parentRef.current.addEventListener('mousedown', mousedown);
        document.body.addEventListener('mousemove', mousemove);
        parentRef.current.addEventListener('mouseup', mouseup);
    }, []);

    return (
        <div ref={parentRef} className={classtext}>
            <div style={{'--progress': `${progress}%`}} className='slider' {...rest}>
                {children}
            </div>
        </div>
    )
}

function Hover3D({ className, children, ...rest })
{
    const parentRef = useRef();

    function slight() { parentRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; }
    function zoom() { parentRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; }

    function move({clientX, clientY})
    {
        const { top, bottom, left, right } = parentRef.current.getBoundingClientRect();

        const
            extent = 7,
            midx = (bottom - top) / 2,
            midY = (right - left) / 2,
            rotationX = extent * (midY - (clientY - top)) / midY,
            rotationY = -extent * (midx - (clientX - left)) / midx;

        parentRef.current.style.transform = `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

    return (
        <div ref={parentRef} className={className === undefined ? 'hover3D' : `hover3D ${className}`} {...rest}
            onMouseOut={slight} onMouseDown={slight} onMouseUp={zoom} onMouseMove={move}>
            {children}
        </div>
    )
}

function SearchBox({searchSpace, matchSpace, ...rest})
{
    if (searchSpace === undefined) return;

    const [noMatch, setNoMatch] = useState(false);
    
    const searchSpaceValues = [...searchSpace].map(x => new String(x).toLowerCase());
    const [mathSpaceValues, setMatchSpaceValues] = matchSpace;

    let
        wait = false,
        lastInput;
    
    function handleChange({target})
    {
        // if (wait) return;
    
        // wait = true;
        
        // if (lastInput === target.value.toLowerCase()) return wait = false;
    
        lastInput = target.value.toLowerCase();

        searchSpaceValues.forEach((item, index) => item.includes(lastInput) ? mathSpaceValues[index] = true : mathSpaceValues[index] = false);

        mathSpaceValues.includes(true) ? setNoMatch(false) : setNoMatch(true);

        setMatchSpaceValues([...mathSpaceValues]);

        // setTimeout(() =>
        // {
        //     wait = false;
    
        //     if (lastInput !== target.value.toLowerCase()) handleChange({target});

        // }, 1000);
    }

    return <input type='text' onChange={handleChange} data-no-match={noMatch} {...rest}/>
}

function CustomModal({visibility: [open, setOpen], parentRef, children})
{
    return (
        <Modal
            closeAfterTransition
            container={parentRef?.current}
            open={open}
            onClose={() => setOpen(false)}
            sx={{ position: 'absolute', inset: 0 }}
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 500, sx: { position: 'absolute', inset: 0, zIndex: 0 } }}}>
            <Fade in={open}>
                <div style={{
                    position: 'absolute',
                    zIndex: 1,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}>
                    {children}
                </div>
            </Fade>
        </Modal>
    );
}

function ContextMenu({visibility, title, options, parentRef})
{
    const clickables = [];

    options.forEach((section, i) =>
    {
        section.components.forEach((comp, index) =>
        {
            clickables.push(
                <ROW key={`${i}${index}`} className={'contextItem'} onClick={section.functions[index]}>
                    {comp}
                </ROW>
            )
        });

        clickables.push(<div key={i} className='divider'/>)
    });

    return (
        <CustomModal visibility={visibility} parentRef={parentRef}>
            <COL className={'contextMenu'}>
                <ROW className={'head'}>
                    <span className='title overflowPrevent' title={title}>{title}</span>
                    <button onClick={() => visibility[1](false)}><CloseRounded/></button>
                </ROW>
                <div className='divider'/>
                <COL className={'options'}>
                    {clickables}
                </COL>
            </COL>
        </CustomModal>
    )
}

export { ROW, COL, GRID, Slider, Hover3D, SearchBox, CustomModal, ContextMenu };