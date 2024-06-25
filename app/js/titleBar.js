function setTitleFontSize()
{
    const
        titleBar = document.getElementById('titleBar'),
        name = titleBar.querySelector('.name');

    let resizeValue = getComputedStyle(titleBar).getPropertyValue('--fs').split('px')[0];

    function resize()
    {
        if (name.offsetHeight < titleBar.offsetHeight) return;

        resizeValue = resizeValue - 0.01;

        titleBar.style.setProperty('--fs', `${resizeValue}px`);

        resize();
    };

    resize();
};

['minimize', 'maximize', 'close'].forEach((x) =>
{
    document.getElementById(x).addEventListener('click', () =>
    {
        if (x === 'close') document.dispatchEvent(new Event('-closeApp'));

        else electron.ipcRenderer.send(`ipc-${x}`);
    });
});

document.addEventListener('-AppLoaded', setTitleFontSize);