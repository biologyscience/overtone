document.querySelector('section.artist .out .body').addEventListener('mouseover', ({currentTarget}) =>
{
    if (!currentTarget.classList.contains('artistItem')) return;

    if (!currentTarget.classList.contains('focus')) return;

    currentTarget.classList.remove('focus');
});