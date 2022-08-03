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

function click(E)
{
    let clickedListItem;

    E.path.forEach((x) =>
    {
        if (x.localName === 'li')
        {
            clickedListItem = x; 
            return;
        }
    });

    const left = clickedListItem.offsetLeft;

    navbar.div.style.setProperty('--left', math(left) + 'px');

    navbar.items.forEach(x => x.id = '');

    show(clickedListItem);
};

function show(listItem)
{
    listItem.id = 'focusHighlight';

    const
        IDofSVG = listItem.querySelector('svg').id,
        displayDiv = document.getElementById('div-' + IDofSVG),
        displayLeftMain = document.getElementById('displayLeftMain');

    Array.from(displayLeftMain.children).forEach(x => x.classList.add('displayNone'));

    displayDiv.classList.remove('displayNone');
};

const startUpHighlight = navbar.items[navbar.items.length - 1];
// const startUpHighlight = navbar.items[0];

navbar.div.style.setProperty('--left', math(startUpHighlight.offsetLeft) + 'px');

show(startUpHighlight);

navbar.items.forEach(x => x.addEventListener('click', click));