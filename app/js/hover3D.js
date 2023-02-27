const hover3D = document.querySelectorAll('.hover3D');

const
    perspective = 1000,
    scale = 1.025;

function move({clientX, clientY, target})
{
    const { top, bottom, left, right } = target.getBoundingClientRect();

    const
        extent = 7,
        midx = (bottom - top) / 2,
        midY = (right - left) / 2,
        rotationX = extent * (midY - (clientY - top)) / midY,
        rotationY = -extent * (midx - (clientX - left)) / midx;

    target.style.transform = `perspective(${perspective}px) scale(${scale}) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
};

hover3D.forEach((x) =>
{
    x.addEventListener('mouseout', () => x.style.transform = `perspective(${perspective}px) scale(1) rotateX(0) rotateY(0)`);
    x.addEventListener('mousedown', () => x.style.transform = `perspective(${perspective}px) scale(1) rotateX(0) rotateY(0)`);
    x.addEventListener('mouseup', () => x.style.transform = `perspective(${perspective}px) scale(${scale}) rotateX(0) rotateY(0)`);
    x.addEventListener('mousemove', move);
});