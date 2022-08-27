function chooseFiles()
{
    const
        { parseFile } = require('music-metadata'),
        { dialog, BrowserWindow } = require('@electron/remote'),
        { existsSync, mkdirSync, writeFileSync } = require('fs'),
        { formatter, read } = require('./js/util');

    const
        options =
        {
            filters: [ { name: 'Music Files', extensions: read.config().allowedMusicFiles } ],
            properties: ['multiSelections', 'showHiddenFiles']
        },

        dir =
        {
            albumArts: 'app/album arts',
            config: './app/json/config.json'
        };

    dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options)
    .then((selected) =>
    {
        if (selected.canceled) return;

        Promise.all([...selected.filePaths.map(x => parseFile(x))]).then((x) =>
        {
            x.forEach((tags) =>
            {
                if (tags.common?.picture)
                {
                    const
                        picture = tags.common.picture[0],
                        formatted = formatter(tags.common.album, tags.common.albumartist);

                    if (existsSync(dir.albumArts) === false) { mkdirSync(dir.albumArts); }
                    
                    const fileLocation = dir.albumArts + '/' + formatted + '.' + picture.format.split('/')[1];

                    if (existsSync(fileLocation)) return;

                    writeFileSync(fileLocation, picture.data);
                }
            });
        })
        .then(() =>
        {
            alert('Album art for the selected songs will be saved in the folder: ' + dir.albumArts);
        });
    });
};

document.getElementById('getAlbumArt').onclick = chooseFiles;