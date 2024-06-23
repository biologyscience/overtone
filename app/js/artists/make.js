/*
code not to be used later (ln 15 17 34) 
reason: code should not be used in later stages (ref js/artists/observer.js)
instead use ln 37
*/

function makeArtistsList()
{
    const
        artists = util.read.artists(),
        artistNames = [...new Map(Object.entries(artists)).keys()];

    const appendIn = document.querySelector('section.artist .out .body');

    const artistObservers = require('./js/artists/observer');

    artistObservers.MO.observe(appendIn, {childList: true});

    artistNames.forEach((x) =>
    {
        const artistItem = document.createElement('div');

        artistItem.innerHTML =
        `
        <img>
        <span class="artistName block overflowPrevent">${x}</span>
        `;
        
        artistItem.classList.add('artistItem');
        artistItem.dataset.artist = x;

        appendIn.append(artistItem);

        artistObservers.IO.observe(artistItem);
    });

    // document.dispatchEvent(new Event('-ArtistsSectionReady'));

    document.getElementById('artistCount').innerHTML = `${artistNames.length} Artist${artistNames.length > 1 ? 's' : ''}`;
};

makeArtistsList();