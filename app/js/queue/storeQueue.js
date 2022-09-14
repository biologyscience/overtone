function storeQueue({detail: {queueList, queueName}})
{
    const { json } = require('./js/util');

    const
        queues = new json('app/json/queues.json'),
        queuesData = queues.read();

    queuesData[queueName] = queueList;

    queues.save();
};

document.addEventListener('-storeQueue', storeQueue);