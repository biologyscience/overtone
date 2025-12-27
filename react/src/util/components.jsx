import { useEffect, useRef, useState } from 'react';

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

    function slight() { parentRef.current.style.transform = 'perspective(1000px) scale(1.025) rotateX(0) rotateY(0)'; }
    function zoom() { parentRef.current.style.transform = 'perspective(1000px) scale(1.05) rotateX(0) rotateY(0)'; }

    function move({clientX, clientY})
    {
        const { top, bottom, left, right } = parentRef.current.getBoundingClientRect();

        const
            extent = 7,
            midx = (bottom - top) / 2,
            midY = (right - left) / 2,
            rotationX = extent * (midY - (clientY - top)) / midY,
            rotationY = -extent * (midx - (clientX - left)) / midx;

        parentRef.current.style.transform = `perspective(1000px) scale(1.1) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
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

    useEffect(() =>
    {
        if (force) player.current.currentTime = (progressPercent || 0) * (player.current.duration || 0) / 100;

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


    useEffect(() =>
    {
        player.current.volume = audioLevel / 100;

    }, [audioLevel]);

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

        audioPlayer.addEventListener('ended', () => setCurrentTime(audioPlayer.duration));
        audioPlayer.addEventListener('timeupdate', updateTime);
        
        return () =>
        {
            audioPlayer.addEventListener('ended', () => setCurrentTime(audioPlayer.duration));
            audioPlayer.removeEventListener('timeupdate', updateTime);
        }
    }, []);

    return <audio ref={player}/>
}

// function RefreshOnNavigate()
// {
//     const location = useLocation();

//     function refresh()
//     {
//         window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

//         document.querySelectorAll('img').forEach(x => x.setAttribute('draggable', false));

//         const titleKey = location.pathname.split('/')[1];

//         const title =
//         {
//             '': 'VizTexa',
//             'app': 'Coming Soon ... VizTexa',
//             'pricing': 'Pricing | VizTexa',
//             'contact': 'Contact Us | VizTexa'
//         };

//         document.title = title[titleKey];

//         if (window.location.hash.length === 0) return;

//         scrollToHash(window.location.hash);
//     };

//     useEffect(refresh, [location]);

//     return null;
// }

// function CustomLink({to, children, className})
// {
//     const navigate = useNavigate();

//     function handleClick(E)
//     {
//         if (E.metaKey || E.ctrlKey || E.shiftKey || E.altKey || E.button !== 0) return;

//         E.preventDefault();

//         navigate(to);
//     }

//     return <a href={to} onClick={handleClick} className={className}>{children}</a>
// }

export { ROW, COL, GRID, Slider, Hover3D, AudioPlayer, SearchBox }