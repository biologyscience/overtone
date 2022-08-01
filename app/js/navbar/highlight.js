const navbar =
{
    div: document.getElementById('navbar'),
    list: document.getElementById('navbarList'),
    items: document.querySelectorAll('.navbarItems')
};

function math(offset)
{
    let x, y, req, tot;

    tot = parseInt(getComputedStyle(navbar.list, '::after').width.split('px')[0]);

    x = parseInt(getComputedStyle(navbar.div).getPropertyValue('--size').split('px')[0]);

    y = (tot - x) / 2;

    req = offset - y;

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

    navbar.list.style.setProperty('--left', math(left) + 'px');

    navbar.items.forEach(x => x.id = '');

    clickedListItem.id = 'focusHighlight';
};

const firstItem = navbar.items[0];

navbar.list.style.setProperty('--left', math(firstItem.offsetLeft) + 'px');

firstItem.id = 'focusHighlight';

navbar.items.forEach(x => x.addEventListener('click', click));