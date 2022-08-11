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
        <div class="dragger flexCenter cursorGrab">
            <img src="svg/drag.svg" class="imgDragger" draggable="false">
        </div>
        <div class="cursorPointer">
            <span class="queueNames overflowPrevent"> ${int} </span>
        </div>
        <div class="options flexCenter">
            <img src="svg/moreHorizontal.svg" class="imgOptions cursorPointer" draggable="false">
        </div>
        `;

        const li = document.createElement('li');

        li.classList.add('currentQueueItems', 'grid');
    
        li.innerHTML = data;

        li.dataset.id = int;

        ql.append(li);

        int++;
    } while (int < 16);
});