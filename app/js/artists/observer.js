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
        albums.forEach(({target, isIntersecting}) =>
        {
            if (isIntersecting) return target.classList.add('visible');
            
            target.classList.remove('visible');
        });
    }, { root: document.querySelector('section.artist .out .body') }),

    MO: new MutationObserver((albums) =>
    {
        albums.forEach(({addedNodes}) =>
        {
            const target = addedNodes[0];

            sorter();

            if (target.isConnected) return artistsObservers.IO.observe(target);
    
            artistsObservers.IO.disconnect(target);
        });
    })
};

/* this part should be used in later stages (ref js/artists/make.js)

artistsObservers.MO.observe(document.querySelector('section.artists .out .body'), { childList: true });
*/

/* below code should not be used in later stages, instead use above */

module.exports = artistsObservers;

/* this is used in js/artists/make.js */