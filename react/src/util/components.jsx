import { useEffect, useRef, useState, cloneElement } from 'react';

import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useSortable, arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

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

function AudioPlayer({file, setCurrentTime, progress: [progressPercent, force], playing, audioLevel})
{
    const player = useRef();
    const preGainRef = useRef();
    const filtersRef = useRef();

    useEffect(() =>
    {
        if (!force) return;
        
        player.current.currentTime = (progressPercent || 0) * (player.current.duration || 0) / 100;

    }, [progressPercent, force]);

    useEffect(() =>
    {
        player.current.pause();
        player.current.src = file;

        setCurrentTime(0);

    }, [file]);

    useEffect(() =>
    {
        if (file === undefined) return;

        if (playing) player.current.play();
        else player.current.pause();

    }, [file, playing]);


    useEffect(() => { player.current.volume = audioLevel / 100; }, [audioLevel]);

    useEffect(() =>
    {
        const audioPlayer = player.current;

        if (audioPlayer === null) return;

        let lastTime = -1;

        function updateTime()
        {
            const { currentTime } = audioPlayer;

            if (Math.abs(currentTime - lastTime) >= 1)
            {
                lastTime = currentTime;

                setCurrentTime(lastTime);
            }
        }

        function init()
        {
            const ctx = new AudioContext();

            const source = ctx.createMediaElementSource(audioPlayer);

            preGainRef.current = ctx.createGain();

            const bands = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

            const filters = bands.map((band) =>
            {
                const filter = ctx.createBiquadFilter();

                filter.type = 'peaking';
                filter.frequency.value = band;
                filter.Q.value = 1;
                filter.gain.value = 0;

                return filter;
            });

            filtersRef.current = filters;

            let node = source;

            [preGainRef.current, ...filters, ctx.destination].forEach((filter) =>
            {
                node.connect(filter);
                node = filter;
            });

            node.connect(ctx.destination);
        }

        function eqChange(index)
        {
            const eqs = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [2.6, 2.6, 1.3, -0.4, -2.8, -3.5, -2.6, -0.4, 1.8, 2.6]
            ];

            preGainRef.current.gain.value = Math.pow(10, -(Math.max(...eqs[index])) / 20);

            filtersRef.current.forEach((x, i) => x.gain.value = eqs[index][i]);
        }

        window.addEventListener('ot-eq0', () => eqChange(0));
        window.addEventListener('ot-eq1', () => eqChange(1));

        audioPlayer.addEventListener('play', init);
        audioPlayer.addEventListener('ended', () => setCurrentTime(audioPlayer.duration));
        audioPlayer.addEventListener('timeupdate', updateTime);
        
        return () =>
        {
            audioPlayer.removeEventListener('play', init);
            audioPlayer.removeEventListener('ended', () => setCurrentTime(audioPlayer.duration));
            audioPlayer.removeEventListener('timeupdate', updateTime);
        }
    }, []);

    return <audio ref={player}/>
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

function SortableList({children})
{
    if (children === undefined) return;

    const [items, setItems] = useState(children);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    function handleDragEnd(event)
    {
        const { active, over } = event;
        
        if (active.id !== over.id)
        {
            setItems((items) =>
            {
                const ids = [...items].map(x => x.props.id);

                const oldIndex = ids.indexOf(active.id);
                const newIndex = ids.indexOf(over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    function SortableItem({id, children})
    {
        const { children: _, className, ...rest } = children.props;

        const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({id});

        const actualChildren = [];

        function toArray(x) { return Array.isArray(x) ? x : [x]; }

        toArray(children.props.children).forEach((child, i) =>
        {
            let toPush = cloneElement(child, {key: i});

            if (child.props['data-is-drag-handle']) toPush = cloneElement(child, {key: i, ...listeners});

            actualChildren.push(toPush);
        });

        return (
            <div ref={setNodeRef} className={`${className} ${isDragging ? 'dragging' : ''}`} style={{transform: `translateX(${transform?.x}px) translateY(${transform?.y}px)`}} {...attributes} {...rest}>
                {actualChildren}
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={[...items].map(x => x.props.id)} strategy={verticalListSortingStrategy}>
                {items.map((item, i) => <SortableItem key={i} id={item.props.id}>{item}</SortableItem>)}
            </SortableContext>
        </DndContext>
    )
}

export { ROW, COL, GRID, Slider, Hover3D, AudioPlayer, SearchBox, CustomModal, SortableList };