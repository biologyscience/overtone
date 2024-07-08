document.querySelector('section.album .out .body').addEventListener('mouseover', ({target}) =>
{
    if (!target.classList.contains('albumItem') || !target.classList.contains('focus')) return;

    target.classList.remove('focus');
});