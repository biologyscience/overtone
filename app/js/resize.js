function handleResize()
{
    const event = new CustomEvent('-changeNavbarItemFocus', {detail: document.querySelector('nav li.current').dataset.displaySection});

    document.dispatchEvent(event);
};

window.addEventListener('resize', handleResize);