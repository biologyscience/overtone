function storeQueue({detail: {queueList, queueName}})
{
    const
        queues = new util.json('app/json/queues.json'),
        queuesData = queues.read();

    if (queuesData[queueName] === undefined)
    {
        queuesData[queueName] = queueList;
        
        queues.save();

        document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail: queueName}));
    }
};

document.addEventListener('-storeQueue', storeQueue);