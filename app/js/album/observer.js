function startObserve()
{
    const outBody = document.querySelector('section.album .out .body');

    const observer = new IntersectionObserver((albums) =>
    {
        albums.forEach((album) =>
        {
            album.target.classList.remove('visible');

            if (!album.isIntersecting) return;
            
            album.target.classList.add('visible');
            
        });
    }, {root: outBody, threshold: 0.25});

    Array.from(outBody.children).forEach(x => observer.observe(x));
};

startObserve();