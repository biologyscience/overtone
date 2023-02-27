document.querySelector('section.artist .out .body').addEventListener('mouseover', ({target}) =>
{
    if (!target.classList.contains('artistItem')) return;

    if (!target.classList.contains('focus')) return;

    target.classList.remove('focus');
});