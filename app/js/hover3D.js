const hover3D = document.querySelector('.hover3D');

let
    hoverEffect = false,
    enteredWithinDelay = false;

function move(E)
{
    const
        height = hover3D.clientHeight,
        width = hover3D.clientWidth,
        extent = 20;

    if (hoverEffect === false) return;

    const
        x = E.layerX,
        y = E.layerY,
        yRotation = extent * ((x - width / 2) / width),
        xRotation = -(extent) * ((y - height / 2) / height);

    hover3D.style.transform = `perspective(1000px) scale(1.01) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
};

hover3D.addEventListener('mouseout', () => hover3D.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)');
hover3D.addEventListener('mousedown', () => hover3D.style.transform = 'perspective(1000px) scale(0.975) rotateX(0) rotateY(0)');
hover3D.addEventListener('mouseup', () => hover3D.style.transform = 'perspective(1000px) scale(1.025) rotateX(0) rotateY(0)');
hover3D.addEventListener('mousemove', move);

hover3D.addEventListener('mouseenter', () =>
{
    setTimeout(() => { hoverEffect = true; }, 1000);

    hoverEffect ? enteredWithinDelay = true : null;
});

hover3D.addEventListener('mouseleave', () => setTimeout(() => { enteredWithinDelay ? enteredWithinDelay = false : hoverEffect = false; }, 1000));