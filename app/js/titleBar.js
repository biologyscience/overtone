{
    const { ipcRenderer } = require('electron');

    ['minimize', 'maximize', 'close'].forEach((x) =>
    {
        document.getElementById(x).addEventListener('click', () =>
        {
            ipcRenderer.send(`ipc-${x}`);
        });
    });
}