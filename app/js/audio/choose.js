function choose()
{
    const remote = require('@electron/remote');

    const options = 
    {
        filters: [ { name: 'Music Files', extensions: ['mp3', 'flac'] } ],
        properties: ['showHiddenFiles', 'multiSelections']
    };

    remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), options)
    .then((selected) =>
    {
        if (selected.canceled) return;

        document.dispatchEvent(new CustomEvent('-selectedFilePaths', {detail: selected.filePaths}));
    });
};

document.getElementById('choose').onclick = choose;