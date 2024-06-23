function updateSongList({detail})
{
    const folderDirs = [...detail];

    const
        songList = new util.json('app/json/songList.json'),
        data = songList.read();

    folderDirs.forEach((dir) =>
    {
        const songListInFolder = fs.readdirSync(dir)
        .filter(a => !fs.statSync(path.join(dir, a)).isDirectory())
        .filter(util.validateMusicFileFormat)
        .map(b => path.join(dir, b));

        data[dir] = songListInFolder;
    });

    songList.save();
};

document.addEventListener('-updateJSON/songList', updateSongList);