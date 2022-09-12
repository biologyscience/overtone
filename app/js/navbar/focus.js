function math(offset)
{
    let x, req, tot;

    tot = parseInt(getComputedStyle(document.querySelector('nav ul'), '::after').width.split('px')[0]);

    x = parseInt(getComputedStyle(document.querySelector('nav')).getPropertyValue('--size').split('px')[0]);

    req = offset - ( (tot - x) / 2 );

    return req;
};

function show(li)
{
    li.classList.add('current');

    const
        sectionName = li.dataset.displaySection,
        displaySection = document.querySelector(`section.${sectionName}`),
        displayLeft = document.getElementById('displayLeft');

    Array.from(displayLeft.children).forEach(x => x.classList.add('displayNone'));

    displaySection.classList.remove('displayNone');
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

    // const startUpHighlight = navbar.items[navbar.items.length - 1];
    const startUpHighlight = navbar.items[1];
    // const startUpHighlight = navbar.items[0];

    navbar.div.style.setProperty('--left', math(startUpHighlight.offsetLeft) + 'px');

    show(startUpHighlight);
};

document.querySelectorAll('nav li').forEach(x => x.addEventListener('click', changeNavbarItemFocus));
document.addEventListener('-changeNavbarItemFocus', changeNavbarItemFocus);
document.addEventListener('-navbarStartup', navbarStartup);