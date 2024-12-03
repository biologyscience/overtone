function updateSongList({detail})
{
    const
        folderDirs = [...detail],
        songsToAdd = [],
        songsToRemove = [];

    const
        songList = new util.json('app/json/songList.json'),
        data = songList.read();

    folderDirs.forEach((dir) =>
    {
        const songListInFolder = fs.readdirSync(dir)
        .filter(a => !fs.statSync(path.join(dir, a)).isDirectory())
        .filter(util.validateMusicFileFormat)
        .map(b => path.join(dir, b));

        const
            oldData = new Set(data[dir]),
            newData = new Set(songListInFolder),
            toAdd = newData.difference(oldData),
            toRemove = oldData.difference(newData);

        Array.from(toAdd).forEach((x) =>
        {
            songsToAdd.push(x);
            data[dir].push(x);
        });

        Array.from(toRemove).forEach((x) =>
        {
            songsToRemove.push(x);
            data[dir].splice(data[dir].indexOf(x), 1);
        });
    });

    songList.save();

    Promise.all(songsToAdd.map(util.getMetaData)).then((tags) =>
    {
        document.dispatchEvent(new CustomEvent('-updateJSON/albums', {detail: {tags, songsToAdd, songsToRemove}}));
        document.dispatchEvent(new CustomEvent('-updateJSON/addArtists', {detail: tags, songsToAdd}));
        document.dispatchEvent(new CustomEvent('-updateJSON/metadata', {detail: {tags, songsToAdd, songsToRemove}}));
    });
};

document.addEventListener('-updateJSON/songList', updateSongList);