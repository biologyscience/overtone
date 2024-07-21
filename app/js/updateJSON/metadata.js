function updateMetadata({detail: {tags, addSongList, removeSongList}})
{    
    const
        metadata = new util.json('app/json/metadata.json'),
        data = metadata.read();

    for (let i = 0; i < addSongList.length; i++)
    {
        data[addSongList[i]] = tags[i];
        data[addSongList[i]].plays = 0;
    }

    if (removeSongList !== undefined) removeSongList.forEach(file => delete data[file]);

    metadata.save();
};

document.addEventListener('-updateJSON/metadata', updateMetadata);