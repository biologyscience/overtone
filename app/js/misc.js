document.getElementById('misc').onclick = () =>
{

};

setTimeout(() => { document.getElementById('loading').classList.add('displayNone') }, 900);

setTimeout(() =>
{
    const x = document.querySelector('.titleHolder').offsetHeight;

    const y = document.querySelector('.queueList').offsetHeight;

    const math = y - (x + 2);

    document.getElementById('queueList').style.height = `${math}px`;

    document.querySelector('.queueList').classList.replace('visibilityHidden', 'displayNone');

    let int = 0;

    const ql = document.getElementById('queueList');

    if (ql.children.length > 0) return;

    do
    {
        const data =
        `
        <div class="dragger flex flexCenter hoverPointer">
            <img src="svg/drag.svg" class="imgDragger" draggable="false">
        </div>
        <div class="info relative hoverPointer">
            <span class="queueNames overflowPrevent"> ${int} </span>
        </div>
        <div class="options flex flexCenter">
            <img src="svg/moreHorizontal.svg" class="imgOptions hoverPointer" draggable="false">
        </div>
        `;

        int++;

        const li = document.createElement('li');

        li.classList.add('currentQueueItems', 'grid');
    
        li.innerHTML = data;

        ql.append(li);
    } while (int < 16);
});