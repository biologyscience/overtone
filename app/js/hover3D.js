const hover3D = document.querySelectorAll('.hover3D');

function move(E)
{
    const target = E.path.reverse().splice(2).filter(x => x.classList.contains('hover3D'))[0];

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
    x.addEventListener('mouseout', () => x.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)');
    x.addEventListener('mousedown', () => x.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)');
    x.addEventListener('mouseup', () => x.style.transform = 'perspective(1000px) scale(1.025) rotateX(0) rotateY(0)');
    x.addEventListener('mousemove', move);
});