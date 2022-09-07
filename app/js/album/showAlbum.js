function showAlbum(E)
{
    const songListInAlbum = document.getElementById('songListInAlbum');

    Array.from(songListInAlbum.children).forEach(x => x.remove());

    const albumItem = E.path[0];

    if (!albumItem.classList.contains('albumItem')) return;

    const { read, getAlbumArt, parseTime } = require('./js/util');

    const
        albumName = albumItem.dataset.albumName,
        metadata = read.metadata(),
        album = read.albums()[albumName];

    album.songs.forEach((x) =>
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

    getAlbumArt(album.songs[0]).then((pic) =>
    {
        head.querySelector('.albumArt img').setAttribute('src', pic.URL);
        head.querySelector('.content .name').innerHTML = albumName;
        head.querySelector('.content .albumArtist').innerHTML = album.artist;
        head.querySelector('.content .year').innerHTML = album.year;
        head.querySelector('.content .songCount').innerHTML = album.songs.length;
        head.querySelector('.content .duration').innerHTML = Object.values(parseTime(album.rawDuration)).join(':');

        document.querySelector('section.album .out').classList.add('displayNone');
        document.querySelector('section.album .in').classList.remove('displayNone');

        let i = 4;

        [
            document.querySelector('section.album .in .head'),
            document.querySelector('section.album .body .columnDividers'),
        ].forEach(x => i = i + x.offsetHeight);
        
        document.getElementById('songListInAlbum').style.height = `calc(var(--displayHeight) - ${i}px)`;
    });
};

document.querySelector('section.album .body').addEventListener('click', showAlbum);