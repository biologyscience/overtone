const hover3D = document.querySelectorAll('.hover3D');

const object = {};

function random()
{
    const number = Math.floor(Math.random() * 100);

    if (object[number] !== undefined) random();

    return number;
};

function move(E)
{
    const target = E.path.reverse().splice(2).filter(x => x.classList.contains('hover3D'))[0];
        
    if (object[target.dataset.uid].hoverEffect === false) return;

    const { top, bottom, left, right } = target.getBoundingClientRect();

    const
        extent = 7,
        midx = (bottom - top) / 2,
        midY = (right - left) / 2,
        rotationX = extent * (midY - (E.clientY - top)) / midY,
        rotationY = -extent * (midx - (E.clientX - left)) / midx;

    target.style.transform = `perspective(1000px) scale(1.01) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
};

hover3D.forEach((x) =>
{
    const rand = random();

    x.dataset.uid = rand;

    object[rand] = { hoverEffect: false, enteredWithinDelay: false };

    x.addEventListener('mouseout', () => x.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)');
    x.addEventListener('mousedown', () => x.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)');
    x.addEventListener('mouseup', () => x.style.transform = 'perspective(1000px) scale(1.025) rotateX(0) rotateY(0)');
    x.addEventListener('mousemove', move);

    const { hoverEffect, enteredWithinDelay } = object[rand];

    x.addEventListener('mouseenter', () =>
    {
        setTimeout(() => { object[rand].hoverEffect = true; }, 1000);

        hoverEffect ? object[rand].enteredWithinDelay = true : null;
    });

    x.addEventListener('mouseleave', () => setTimeout(() => { enteredWithinDelay ? object[rand].enteredWithinDelay = false : object[rand].hoverEffect = false; }, 1000));
});

console.log(object)