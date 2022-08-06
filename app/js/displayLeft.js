function setHeight()
{
    let y = document.getElementById('navbar').offsetHeight;

    Array.from(document.getElementById('div-queue').children).forEach(x => x.id === 'content' ? null : y = y + x.offsetHeight);

    document.getElementById('content').style.height = `calc(100vh - ${y + 2}px)`;
};

setTimeout(setHeight);

setTimeout(() => { document.getElementById('displayLeft').classList.remove('opacity0', 'visibilityHidden'); }, 1000);