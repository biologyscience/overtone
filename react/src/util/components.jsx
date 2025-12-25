import { useEffect, useRef } from 'react';

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

function Slider({ progress, setProgress, vertical, className, children, ...rest })
{
    let classtext = 'sliderWrapper';

    if (vertical) classtext += ' vertical';
    if (className !== undefined) classtext += ` ${className}`;

    const parentRef = useRef();
    const pressing = useRef(false);

    function mouseup()
    {
        pressing.current = false;

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

function scrollToHash(hash)
{
    const element = document.querySelector(`[data-hash="${hash}"]`);
    
    const offset = element.getBoundingClientRect().top + window.pageYOffset - 120;
    
    window.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
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

export { ROW, COL, GRID, Slider, Hover3D, scrollToHash }