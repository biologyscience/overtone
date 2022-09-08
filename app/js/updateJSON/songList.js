function updateSongList({detail})
{
    const folderDirs = [...detail];

    const { readdirSync, statSync } = require('fs');

    const { join } = require('path');

    const { json, validateMusicFileFormat } = require('./js/util');

    const
        songList = new json('app/json/songList.json'),
        data = songList.read();

    folderDirs.forEach((dir) =>
    {
        const songListInFolder = readdirSync(dir)
        .filter(a => !statSync(join(dir, a)).isDirectory())
        .filter(validateMusicFileFormat)
        .map(b => join(dir, b));

        data[dir] = songListInFolder;
    });

    songList.save();
};

document.addEventListener('-updateJSON/songList', updateSongList);