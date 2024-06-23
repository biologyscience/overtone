function choose()
{
    const options = 
    {
        filters: [ { name: 'Music Files', extensions: util.read.config().allowedMusicFileFormats } ],
        properties: ['showHiddenFiles', 'multiSelections']
    };

    remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), options)
    .then((selected) =>
    {
        if (selected.canceled) return;

        const queueName = new Date().toLocaleString();

        document.dispatchEvent(new CustomEvent('-selectedFilePaths', {detail: {filePaths: selected.filePaths, queueName}}));
    });
};

document.getElementById('choose').addEventListener('click', choose);