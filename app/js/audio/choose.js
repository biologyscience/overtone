function choose()
{
    const { dialog, BrowserWindow } = require('@electron/remote');

    const options = 
    {
        filters: [ { name: 'Music Files', extensions: ['mp3', 'flac'] } ],
        properties: ['showHiddenFiles', 'multiSelections']
    };

    dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options)
    .then((selected) =>
    {
        if (selected.canceled) return;

        document.dispatchEvent(new CustomEvent('-selectedFilePaths', {detail: selected.filePaths}));
    });
};

document.getElementById('choose').onclick = choose;