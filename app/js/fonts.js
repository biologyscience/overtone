const fonts = [];

document.fonts.forEach(x => fonts.push(x.family));

const checkbox = document.querySelector('section.extras .fontSelection .checkboxes');

function choose({target})
{
    [...checkbox.children].forEach(x => x.classList.remove('currentFont'));
    
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

fonts.forEach((x) =>
{
    const li = document.createElement('li');

    li.innerHTML = x;
    li.style.fontFamily = x;

    if (` "${x}"` === getComputedStyle(document.querySelector(':root')).getPropertyValue('--currentFont')) li.classList.add('currentFont');

    checkbox.append(li);

    li.addEventListener('click', choose);
});

document.querySelector('section.extras .fontSelection .choose').addEventListener('click', showFontList);