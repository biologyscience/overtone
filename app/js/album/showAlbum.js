function showAlbum(E)
{
    const songListInAlbum = document.getElementById('songListInAlbum');

    Array.from(songListInAlbum.children).forEach(x => x.remove());

    const albumItem = E.target;

    if (!albumItem.classList.contains('albumItem')) return;

    const { read, parseTime, sort } = require('./js/util');

    const
        id = albumItem.dataset.id,
        metadata = read.metadata(),
        { album, artist, rawDuration, songs, year } = read.albums()[id];

    songs.sort(sort.byTrackNumber).forEach((x) =>
    {
        const li = document.createElement('li');

        li.innerHTML =
        `
        <div class="song">
            <span class="name">${metadata[x].title}</span>
            <span class="artist">${metadata[x].artists.join(', ')}</span>
        </div>
        <div class="plays">${0}</div>
        <div class="duration">${metadata[x].duration}</div>
        `;
        
        li.dataset.songName = metadata[x].title.toLowerCase();
        li.dataset.trackNumber = metadata[x].track.no;
        
        songListInAlbum.append(li);
    });

    const head = document.querySelector('section.album .in .head');

    head.querySelector('.albumArt img').setAttribute('src', `webp/${id}.webp`);
    head.querySelector('.content .name').innerHTML = album;
    head.querySelector('.content #albumArtistInAlbumItem').innerHTML = artist;
    head.querySelector('.content .year').innerHTML = year;
    head.querySelector('.content .songCount').innerHTML = songs.length;
    head.querySelector('.content .duration').innerHTML = Object.values(parseTime(rawDuration)).join(':');

    document.querySelector('section.album .out').classList.add('displayNone');
    document.querySelector('section.album .in').classList.remove('displayNone');
};

function hideAlbum()
{
    document.querySelector('section.album .out').classList.remove('displayNone');
    document.querySelector('section.album .in').classList.add('displayNone');
    document.getElementById('inAlbumInput').value = '';
};

document.querySelector('section.album .body').addEventListener('click', showAlbum);
document.getElementById('backToAlbumOut').addEventListener('click', hideAlbum);