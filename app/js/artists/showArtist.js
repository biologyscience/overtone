function showArtist(E)
{
    const albumListInArtist = document.getElementById('albumListInArtist');

    Array.from(albumListInArtist.children).forEach(x => x.remove());

    const artistItem = E.target;

    if (!artistItem.classList.contains('artistItem')) return;

    const
        artistName = artistItem.dataset.artist,
        albumList = util.read.artists()[artistName],
        sortedByYear = [];

    let temp = [];

    for (const albumInfo of albumList)
    {
        const { album, year } = albumInfo;

        temp.push([album, year]);
    }

    temp.sort((a, b) => b[1] - a[1]).forEach(x => sortedByYear.push(x.reverse().pop()));

    sortedByYear.forEach((x) =>
    {
        const id = util.formatter(x, artistName);

        const div = document.createElement('div');

        div.innerHTML =
        `
        <div class="imgWrapper flex">
            <img src="webp/${id}.webp">
        </div>
        <div class="info flexCol">
            <span class="albumName overflowPrevent">${x}</span>
            <span class="year">${util.read.albums()[id].year}</span>
        </div
        `;

        div.classList.add('albumItem');
        div.dataset.albumName = x;
        
        albumListInArtist.append(div);
    });

    document.getElementById('artistPicture').dataset.artistName = artistName;

    const head = document.querySelector('section.artist .in .head');

    head.querySelector('.content .name').innerHTML = artistName;
    head.querySelector('.content .albumCount').innerHTML = `${util.read.artists()[artistName].length} Album${util.read.artists()[artistName].length > 1 ? 's' : ''}`;

    document.querySelector('section.artist .out').classList.add('displayNone');
    document.querySelector('section.artist .in').classList.remove('displayNone');
};

function hideArtist()
{
    document.querySelector('section.artist .out').classList.remove('displayNone');
    document.querySelector('section.artist .in').classList.add('displayNone');
    document.getElementById('inArtistInput').value = '';
};

document.querySelector('section.artist .body').addEventListener('click', showArtist);
document.getElementById('backToArtistOut').addEventListener('click', hideArtist);