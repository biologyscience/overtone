function handleResize()
{
    const event = new CustomEvent('-changeNavbarItemFocus', {detail: document.querySelector('nav li.current').dataset.displaySection});

    document.dispatchEvent(event);
};

document.addEventListener('-AppLoaded', () => window.addEventListener('resize', handleResize));