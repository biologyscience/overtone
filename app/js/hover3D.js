const hover3D = document.querySelector('.hover3D');

const
    height = hover3D.clientHeight,
    width = hover3D.clientWidth,
    extent = 20;

let
    hoverEffect = false,
    enteredWithinDelay = false;

hover3D.addEventListener('mouseout', () => hover3D.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)');
hover3D.addEventListener('mousedown', () => hover3D.style.transform = 'perspective(1000px) scale(0.975) rotateX(0) rotateY(0)');
hover3D.addEventListener('mouseup', () => hover3D.style.transform = 'perspective(1000px) scale(1.025) rotateX(0) rotateY(0)');

hover3D.addEventListener('mousemove', (E) =>
{
    if (hoverEffect === false) return;

    const
        xVal = E.layerX,
        yVal = E.layerY,
        yRotation = extent * ((xVal - width / 2) / width),
        xRotation = -(extent) * ((yVal - height / 2) / height);

    hover3D.style.transform = 'perspective(1000px) scale(1.025) rotateX(' + xRotation + 'deg) rotateY(' + yRotation + 'deg)';
});

hover3D.addEventListener('mouseenter', () =>
{
    setTimeout(() => { hoverEffect = true; }, 1000);

    hoverEffect ? enteredWithinDelay = true : null;

});

hover3D.addEventListener('mouseleave', () => setTimeout(() => { enteredWithinDelay ? enteredWithinDelay = false : hoverEffect = false; }, 1000));