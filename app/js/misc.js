document.getElementById('misc').onclick = () =>
{
    const x = document.querySelector('.queue.current');

    x.removeEventListener('pointerdown', () => { console.log('x') }, true);

    // console.log(x)
};