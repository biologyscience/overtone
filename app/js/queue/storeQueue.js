function storeQueue({detail: {queueList, queueName, store}})
{
    if (!store) return;

    const
        queues = new util.json('app/json/queues.json'),
        queuesData = queues.read();

    queuesData.queueOrder.push(queueName);

    queuesData[queueName] = queueList;
        
    queues.save();

    document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail: queueName}));
};

document.addEventListener('-storeQueue', storeQueue);