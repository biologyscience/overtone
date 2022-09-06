function startObserve()
{
    const options =
    {
        root: document.querySelector('section.album .body'),
        threshold: 0.25
    };

    const observer = new IntersectionObserver((items) =>
    {
        items.forEach((item) =>
        {
            if (item.isIntersecting)
            {
                item.target.classList.remove('visibilityHidden');
            }
    
            else
            {
                item.target.classList.add('visibilityHidden');
            }
        });
    }, options);

    document.querySelectorAll('section.album .body .albumItem').forEach(x => observer.observe(x));
};

document.addEventListener('-albumReady', startObserve);