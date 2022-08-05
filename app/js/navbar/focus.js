const navbar =
{
    div: document.getElementById('navbar'),
    list: document.getElementById('navbarList'),
    items: document.querySelectorAll('.navbarItems')
};

function math(offset)
{
    let x, req, tot;

    tot = parseInt(getComputedStyle(navbar.list, '::after').width.split('px')[0]);

    x = parseInt(getComputedStyle(navbar.div).getPropertyValue('--size').split('px')[0]);

    req = offset - ( (tot - x) / 2 );

    return req;
};

function show(li)
{
    li.id = 'focusHighlight';

    const
        IDofSVG = li.querySelector('svg').id,
        displayDiv = document.getElementById('div-' + IDofSVG),
        displayLeftMain = document.getElementById('displayLeftMain');

    Array.from(displayLeftMain.children).forEach(x => x.classList.add('displayNone'));

    displayDiv.classList.remove('displayNone');
};

function changeNavbarItemFocus(E)
{
    const li = require('./js/util').getElement('li', E);

    const left = li.offsetLeft;

    navbar.div.style.setProperty('--left', math(left) + 'px');

    navbar.items.forEach(x => x.id = '');

    show(li);
};

setTimeout(() =>
{
    const startUpHighlight = navbar.items[navbar.items.length - 1];
    // const startUpHighlight = navbar.items[0];

    navbar.div.style.setProperty('--left', math(startUpHighlight.offsetLeft) + 'px');

    show(startUpHighlight);
}, 500);

navbar.items.forEach(x => x.addEventListener('click', changeNavbarItemFocus));

document.addEventListener('-changeNavbarItemFocus', changeNavbarItemFocus);