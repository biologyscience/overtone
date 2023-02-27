document.querySelector('section.album .out .body').addEventListener('mouseover', ({currentTarget}) =>
{
    if (!currentTarget.classList.contains('albumItem')) return;

    if (!currentTarget.classList.contains('focus')) return;

    currentTarget.classList.remove('focus');
});