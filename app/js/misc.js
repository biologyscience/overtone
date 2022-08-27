document.getElementById('misc').onclick = () =>
{
    document.getElementById('pauseORplay').animate([
        {
            opacity: 0,
            transform: 'rotate(0deg)'
        },

        {
            // opacity: 1,
            transform: 'rotate(360deg)',

            offset: 0.5
        },

        {
            opacity: 1,
            // transform: 'rotate(360deg)'
        }
    ], {duration: 1000, easing: 'ease', fill: 'forwards'});
};