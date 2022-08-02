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

    navbar.list.style.setProperty('--left', math(left) + 'px');

    navbar.items.forEach(x => x.id = '');

    clickedListItem.id = 'focusHighlight';

    changeID(clickedListItem);
};

function changeID(listItem)
{
    const
        IDofSVG = listItem.querySelector('svg').id,
        displayDiv = document.getElementById('div-' + IDofSVG),
        displayLeftRest = document.getElementById('displayLeftRest');

    for (let index = 0; index <= (displayLeftRest.children.length - 1); index++)
    { displayLeftRest.children[index].classList.add('displayNone'); }

    displayDiv.classList.remove('displayNone');
};

const lastItem = navbar.items[navbar.items.length - 1];

navbar.list.style.setProperty('--left', math(lastItem.offsetLeft) + 'px');

lastItem.id = 'focusHighlight';

changeID(lastItem);

setTimeout(() => { navbar.list.style.setProperty('--opacity', 1); }, 250);

navbar.items.forEach(x => x.addEventListener('click', click));