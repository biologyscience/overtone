function updateMetadata({detail: {tags, songList}})
{    
    const
        metadata = new util.json('app/json/metadata.json'),
        data = metadata.read();

    for (let i = 0; i < songList.length; i++)
    { data[songList[i]] = tags[i]; }

    metadata.save();
};

document.addEventListener('-updateJSON/metadata', updateMetadata);