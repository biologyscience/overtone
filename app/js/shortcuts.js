function shortcutHandle(key)
{
    if (key === 'space') document.getElementById('pauseORplay').click();
};

document.addEventListener('keydown', ({code}) =>
{
    if (document.activeElement.tagName === 'INPUT') return;

    shortcutHandle(code.toLowerCase());
});