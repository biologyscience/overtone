function sorter()
{
    const albumList = document.querySelector('section.artist .out .body');
    const albums = Array.from(albumList.children);

    artistsObservers.MO.disconnect();

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

    artistsObservers.MO.observe(albumList, { childList: true });
};

const artistsObservers =
{
    IO: new IntersectionObserver((albums) =>
    {
        albums.forEach(({currentTarget, isIntersecting}) =>
        {
            if (isIntersecting) return currentTarget.classList.add('visible');
            
            currentTarget.classList.remove('visible');
        });
    }, { root: document.querySelector('section.artist .out .body') }),

    MO: new MutationObserver((albums) =>
    {
        albums.forEach(({addedNodes}) =>
        {
            const currentTarget = addedNodes[0];

            sorter();

            if (currentTarget.isConnected) return artistsObservers.IO.observe(currentTarget);
    
            artistsObservers.IO.disconnect(currentTarget);
        });
    })
};

/* this part should be used in later stages (ref js/artists/make.js)

artistsObservers.MO.observe(document.querySelector('section.artists .out .body'), { childList: true });
*/

/* below code should not be used in later stages, instead use above */

module.exports = artistsObservers;

/* this is used in js/artists/make.js */