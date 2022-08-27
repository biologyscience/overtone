function storeQueue({detail: {queueList, queueName}})
{
    const { json, getMetaData } = require('./js/util');

    const
        temp = [],
        fileLocations = [];

    const
        queues = new json('app/json/queues.json'),
        metadata = new json('app/json/metadata.json'),

        queuesData = queues.read(),
        metadataData = metadata.read();

    queuesData[queueName] = queueList;

    queues.save();

    queueList.forEach(x => metadataData[x] === undefined ? temp.push(getMetaData(x)) && fileLocations.push(x) : null);

    if (temp.length > 0)
    {
        Promise.all(temp).then((tags) =>
        {
            for (let i = 0; i < fileLocations.length; i++)
            {
                metadataData[fileLocations[i]] = temp[i];
            }

            
        });
    }
};

document.addEventListener('-storeQueue', storeQueue);