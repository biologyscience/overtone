function updateMetadata({detail})
{
    const pathToSongs = detail;

    const { getMetaData, json } = require('./js/util');
    
    const
        metadata = new json('app/json/metadata.json'),
        data = metadata.read();

    Promise.all(pathToSongs.map(getMetaData)).then((tags) =>
    {
        for (let i = 0; i < pathToSongs.length; i++) { data[pathToSongs[i]] = tags[i]; }

        metadata.save();
    });
};

document.addEventListener('-updateJSON/metadata', updateMetadata);