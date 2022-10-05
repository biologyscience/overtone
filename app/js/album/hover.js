document.querySelector('section.album .out .body').addEventListener('mouseover', ({path}) =>
{
    const target = path[0];

    if (!target.classList.contains('albumItem')) return;

    if (!target.classList.contains('focus')) return;

    target.classList.remove('focus');
});