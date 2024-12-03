function updateMetadata({detail: {tags, songsToAdd, songsToRemove}})
{    
    const
        metadata = new util.json('app/json/metadata.json'),
        data = metadata.read();

    for (let i = 0; i < songsToAdd.length; i++)
    {
        data[songsToAdd[i]] = tags[i];
        data[songsToAdd[i]].plays = 0;
    }

    if (songsToRemove.length > 0) songsToRemove.forEach(file => delete data[file]);

    metadata.save();
};

document.addEventListener('-updateJSON/metadata', updateMetadata);