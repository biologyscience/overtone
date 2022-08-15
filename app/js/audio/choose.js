function choose()
{
    const { dialog, BrowserWindow } = require('@electron/remote');

    const options = 
    {
        filters: [ { name: 'Music Files', extensions: ['mp3', 'flac', 'ogg', 'wav'] } ],
        properties: ['showHiddenFiles', 'multiSelections']
    };

    dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options)
    .then((selected) =>
    {
        if (selected.canceled) return;

        const queueName = new Date().toLocaleString();

        document.dispatchEvent(new CustomEvent('-selectedFilePaths', {detail: {filePaths: selected.filePaths, queueName}}));
    });
};

document.getElementById('choose').onclick = choose;