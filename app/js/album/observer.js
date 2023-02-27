function sorter()
{
    const albumList = document.querySelector('section.album .out .body');
    const albums = Array.from(albumList.children);

    albumObservers.MO.disconnect();

    albums.sort((a, b) =>
    {
        const albumName =
        {
            A: a.querySelector('span').innerHTML,
            B: b.querySelector('span').innerHTML
        };

        return albumName.A.localeCompare(albumName.B);
    });

    Array.from(albumList.children).forEach(x => x.remove());

    albums.forEach(x => albumList.append(x));

    albumObservers.MO.observe(albumList, { childList: true });
};

const albumObservers =
{
    IO: new IntersectionObserver((albums) =>
    {
        albums.forEach(({currentTarget, isIntersecting}) =>
        {
            if (isIntersecting) return currentTarget.classList.add('visible');
            
            currentTarget.classList.remove('visible');
        });
    }, { root: document.querySelector('section.album .out .body') }),

    MO: new MutationObserver((albums) =>
    {
        albums.forEach(({addedNodes}) =>
        {
            const currentTarget = addedNodes[0];

            sorter();

            if (currentTarget.isConnected) return albumObservers.IO.observe(currentTarget);
    
            albumObservers.IO.disconnect(currentTarget);
        });
    })
};

/* this part should be used in later stages (ref js/album/make.js)

albumObservers.MO.observe(document.querySelector('section.album .out .body'), { childList: true });
*/

/* below code should not be used in later stages, instead use above */

module.exports = albumObservers;

/* this is used in js/album/make.js */