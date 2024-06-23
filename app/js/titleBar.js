['minimize', 'maximize', 'close'].forEach((x) =>
{
    document.getElementById(x).addEventListener('click', () =>
    {
        if (x === 'close') document.dispatchEvent(new Event('-closeApp'));

        else electron.ipcRenderer.send(`ipc-${x}`);
    });
});