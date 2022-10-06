function handleResize()
{
    document.dispatchEvent(new CustomEvent('-changeNavbarItemFocus', {detail: document.querySelector('nav li.current').dataset.displaySection}));

    document.dispatchEvent(new Event('-resizeCanvas'));
};

document.addEventListener('-AppLoaded', () => window.addEventListener('resize', handleResize));