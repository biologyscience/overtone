function storeQueue({detail: {queueList, queueName}})
{
    const
        queues = new util.json('app/json/queues.json'),
        queuesData = queues.read();

    let alreadyExists = false;

    queuesData.forEach(x => { if (x.filePaths.join('') === queueList.join('')) return alreadyExists = true; });
    
    if (alreadyExists) return;

    queuesData.push(
        {
            queueName,
            position: queuesData.length + 1,
            filePaths: queueList
        }
    );
    
    queues.save();

    document.dispatchEvent(new CustomEvent('-addItemToQueueList', {detail: queueName}));
};

document.addEventListener('-storeQueue', storeQueue);