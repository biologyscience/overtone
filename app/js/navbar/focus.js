function math(offset)
{
    let x, req, tot;

    tot = parseInt(getComputedStyle(document.getElementById('navbarList'), '::after').width.split('px')[0]);

    x = parseInt(getComputedStyle(document.getElementById('navbar')).getPropertyValue('--size').split('px')[0]);

    req = offset - ( (tot - x) / 2 );

    return req;
};

function show(li)
{
    li.id = 'focusHighlight';

    const
        IDofSVG = li.querySelector('svg').id,
        displayDiv = document.querySelector(`section.${IDofSVG}`),
        displayLeft = document.getElementById('displayLeft');

    Array.from(displayLeft.children).forEach(x => x.classList.add('displayNone'));

    displayDiv.classList.remove('displayNone');
};

function changeNavbarItemFocus(E)
{
    const li = require('./js/util').getElement('li', E);

    const left = li.offsetLeft;

    document.getElementById('navbar').style.setProperty('--left', math(left) + 'px');

    document.querySelectorAll('.navbarItems').forEach(x => x.id = '');

    show(li);
};

function navbarStartup()
{
    const navbar =
    {
        div: document.getElementById('navbar'),
        items: document.querySelectorAll('.navbarItems')
    };

    // const startUpHighlight = navbar.items[navbar.items.length - 1];
    const startUpHighlight = navbar.items[1];
    // const startUpHighlight = navbar.items[0];

    navbar.div.style.setProperty('--left', math(startUpHighlight.offsetLeft) + 'px');

    show(startUpHighlight);
};

document.querySelectorAll('.navbarItems').forEach(x => x.addEventListener('click', changeNavbarItemFocus));
document.addEventListener('-changeNavbarItemFocus', changeNavbarItemFocus);
document.addEventListener('-navbarStartup', navbarStartup);