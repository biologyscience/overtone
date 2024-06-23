const checkbox = document.querySelector('section.extras .fontSelection .checkboxes');

function choose(E)
{
    if (E === undefined) return document.querySelector(':root').style.setProperty('--currentFont', util.read.config().font);

    [...checkbox.children].forEach(x => x.classList.remove('currentFont'));

    let target = E.type == '-setFont' ? [...checkbox.children].filter(x => x.innerHTML == E.detail)[0] : E.target;
    
    target.classList.add('currentFont');

    document.querySelector(':root').style.setProperty('--currentFont', target.innerHTML);

    const
        config = new util.json('app/json/config.json'),
        configData = config.read();

    configData.font = target.innerHTML;

    config.save();
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

document.fonts.forEach(({family}) =>
{
    const li = document.createElement('li');

    li.innerHTML = family;
    li.style.fontFamily = family;

    if (` "${family}"` === getComputedStyle(document.querySelector(':root')).getPropertyValue('--currentFont')) li.classList.add('currentFont');

    checkbox.append(li);

    li.addEventListener('click', choose);
});

document.querySelector('section.extras .fontSelection .choose').addEventListener('click', showFontList);
document.addEventListener('-setFont', choose);
choose();