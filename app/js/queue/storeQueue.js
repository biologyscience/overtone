function storeQueue({detail: {queueList, queueName}})
{
    const { json } = require('./js/util');

    try
    {
        const
            file = new json('app/json/queues.json'),
            queues = file.read();
    
        queues[queueName] = queueList;
    
        file.save();

    } catch (e) { alert('Caannot write queue details to queues file !\nRestarting the app should fix it.'); }
};

document.addEventListener('-storeQueue', storeQueue);