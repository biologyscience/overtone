const checkbox = document.querySelector('section.extras .fontSelection .checkboxes');

function choose(E)
{
    const children = Array.from(checkbox.children);

    children.forEach(x => x.classList.remove('currentFont'));

    let target = E.type === '-setFont' ? children.filter(x => x.innerHTML === E.detail)[0] : E.target;
    
    target.classList.add('currentFont');

    document.querySelector(':root').style.setProperty('--currentFont', target.innerHTML);
};

function showFontList({target})
{
    if (target.dataset.isOpen === 'false')
    {
        checkbox.style.setProperty('visibility', 'visible');

        target.dataset.isOpen = 'true';
    }

    else
    {
        checkbox.style.setProperty('visibility', 'hidden');

        target.dataset.isOpen = 'false';
    }
};

document.querySelector('section.extras .fontSelection .choose').addEventListener('click', showFontList);
document.addEventListener('-setFont', choose);

document.addEventListener('-AppLoaded', () =>
{
    document.fonts.forEach(({family}) =>
    {
        const li = document.createElement('li');
        
        li.innerHTML = family;
        li.style.fontFamily = family;
        
        if (family === getComputedStyle(document.querySelector(':root')).getPropertyValue('--currentFont')) li.classList.add('currentFont');

        checkbox.append(li);
        
        li.addEventListener('click', choose);
    });
});