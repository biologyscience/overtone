const eventBus = new EventTarget();

const originalDispatch = eventBus.dispatchEvent.bind(eventBus);

// UNCOMMENT BELOW TO TRACK EVENT LOGS
// eventBus.dispatchEvent = (E) => { console.log({type: E?.type, detail: E?.detail}); return originalDispatch(E); } 

export default eventBus;