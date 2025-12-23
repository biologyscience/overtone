import { Component, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

class ROW extends Component
{
    render()
    {
        const { className, children, ...rest } = this.props;

        return (
            <div className={className === undefined ? 'flexROW' : `flexROW ${className}`} {...rest}>
                {children}
            </div>
        )
    }
}

class COL extends Component
{
    render()
    {
        const { className, children, ...rest } = this.props;

        return (
            <div className={className === undefined ? 'flexCOL' : `flexCOL ${className}`} {...rest}>
                {children}
            </div>
        )
    }
}

class GRID extends Component
{
    render()
    {
        const { className, children, ...rest } = this.props;

        return (
            <div className={className === undefined ? 'grid' : `grid ${className}`} {...rest}>
                {children}
            </div>
        )
    }
}

function scrollToHash(hash)
{
    const element = document.querySelector(`[data-hash="${hash}"]`);
    
    const offset = element.getBoundingClientRect().top + window.pageYOffset - 120;
    
    window.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
}

function RefreshOnNavigate()
{
    const location = useLocation();

    function refresh()
    {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

        document.querySelectorAll('img').forEach(x => x.setAttribute('draggable', false));

        const titleKey = location.pathname.split('/')[1];

        const title =
        {
            '': 'VizTexa',
            'app': 'Coming Soon ... VizTexa',
            'pricing': 'Pricing | VizTexa',
            'contact': 'Contact Us | VizTexa'
        };

        document.title = title[titleKey];

        if (window.location.hash.length === 0) return;

        scrollToHash(window.location.hash);
    };

    useEffect(refresh, [location]);

    return null;
}

function CustomLink({to, children, className})
{
    const navigate = useNavigate();

    function handleClick(E)
    {
        if (E.metaKey || E.ctrlKey || E.shiftKey || E.altKey || E.button !== 0) return;

        E.preventDefault();

        navigate(to);
    }

    return <a href={to} onClick={handleClick} className={className}>{children}</a>
}

export { ROW, COL, GRID, scrollToHash, RefreshOnNavigate, CustomLink }