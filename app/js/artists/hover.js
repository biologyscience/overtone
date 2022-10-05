document.querySelector('section.artist .out .body').addEventListener('mouseover', ({path}) =>
{
    const target = path[0];

    if (!target.classList.contains('artistItem')) return;

    if (!target.classList.contains('focus')) return;

    target.classList.remove('focus');
});