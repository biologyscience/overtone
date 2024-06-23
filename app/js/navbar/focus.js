function math(offset)
{
    let x, req, tot;

    tot = parseInt(getComputedStyle(document.querySelector('nav'), '::after').width.split('px')[0]);

    x = parseInt(getComputedStyle(document.querySelector('nav')).getPropertyValue('--size').split('px')[0]);

    req = offset - ( (tot - x) / 2 );

    return req;
};

function show(li)
{
    li.classList.add('current');

    const
        multiplier = li.dataset.multiplier,
        displayLeft = document.getElementById('displayLeft');
    
    displayLeft.style.transform = `translateX(calc(-60vw * ${multiplier}))`;
};

function changeNavbarItemFocus(E)
{
    const li = typeof(E.detail) === 'string' ? document.querySelector(`[data-display-section="${E.detail}"]`) : E.target;

    document.querySelector('nav').style.setProperty('--left', math(li.offsetLeft) + 'px');

    document.querySelectorAll('nav li').forEach(x => x.classList.remove('current'));

    show(li);
};

function navbarStartup()
{
    const navbar =
    {
        div: document.querySelector('nav'),
        items: document.querySelectorAll('nav li')
    };

    //
    const startUpHighlight = navbar.items[2];
    //
    
    navbar.div.style.setProperty('--left', `${math(startUpHighlight.offsetLeft)}px`);

    show(startUpHighlight);
};

document.querySelectorAll('nav li').forEach(x => x.addEventListener('click', changeNavbarItemFocus));
document.addEventListener('-changeNavbarItemFocus', changeNavbarItemFocus);
navbarStartup();