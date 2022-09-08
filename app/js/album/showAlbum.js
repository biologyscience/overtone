function showAlbum(E)
{
    const songListInAlbum = document.getElementById('songListInAlbum');

    Array.from(songListInAlbum.children).forEach(x => x.remove());

    const albumItem = E.path[0];

    if (!albumItem.classList.contains('albumItem')) return;

    const { read, parseTime } = require('./js/util');

    const
        id = albumItem.dataset.id,
        metadata = read.metadata(),
        { album, artist, rawDuration, songs, year } = read.albums()[id];

    songs.forEach((x) =>
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
        
        songListInAlbum.append(li);
    });

    const head = document.querySelector('section.album .in .head');

    head.querySelector('.albumArt img').setAttribute('src', `webp/${id}.webp`);
    head.querySelector('.content .name').innerHTML = album;
    head.querySelector('.content .albumArtist').innerHTML = artist;
    head.querySelector('.content .year').innerHTML = year;
    head.querySelector('.content .songCount').innerHTML = songs.length;
    head.querySelector('.content .duration').innerHTML = Object.values(parseTime(rawDuration)).join(':');

    document.querySelector('section.album .out').classList.add('displayNone');
    document.querySelector('section.album .in').classList.remove('displayNone');
};

document.querySelector('section.album .body').addEventListener('click', showAlbum);