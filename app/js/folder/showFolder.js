function showFolder({currentTarget})
{
    const { read, parseTime } = require('./js/util');

    let
        duration,
        totalTime = 0;

    const
        path = currentTarget.dataset.path,
        name = path.split('\\');
    
    const
        metadata = read.metadata(),
        songList = read.songList();

    document.getElementById('folderName').innerHTML = name[name.length - 1];
    document.getElementById('songCount').innerHTML = `${songList[path].length} songs`;

    document.querySelector('section.folder .in').classList.remove('displayNone');
    document.querySelector('section.folder .out').classList.add('displayNone');

    const songListInFolder = document.getElementById('songListInFolder');

    Array.from(songListInFolder.children).forEach(x => x.remove());

    songList[path].forEach((x) =>
    {
        const li = document.createElement('li');

        li.innerHTML =
        `
        <div class="after relative cursorPointer flexCol" data-song-duration="${metadata[x].duration}">
            <span class="songName overflowPrevent">${metadata[x].title}</span>
            <span class="artistName overflowPrevent">${metadata[x].albumArtist}</span>
            <span class="albumName overflowPrevent">${metadata[x].album}</span>
        </div>
        <div class="flex flexCenter cursorPointer">
            <img src="svg/moreHorizontal.svg" draggable="false">
        </div>
        `;

        li.dataset.path = x;
        li.dataset.title = metadata[x].title.toLowerCase();

        li.classList.add('songListInFolderItems', 'grid');

        songListInFolder.append(li);

        totalTime = totalTime + metadata[x].rawDuration;
    });

    const
        time = parseTime(totalTime),
        hours = time.hours,
        minutes = time.minutes,
        seconds = time.seconds.toString().length > 1 ? time.seconds : `0${time.seconds}`;

    time.hours > 0 ? duration = `${hours}:${minutes}:${seconds}` : duration = `${minutes}:${seconds}`;

    document.getElementById('totalDurationOfSongs').innerHTML = duration;

    document.dispatchEvent(new Event('-folderReady'));
};

function hideFolder()
{
    document.querySelector('section.folder .in').classList.add('displayNone');
    document.querySelector('section.folder .out').classList.remove('displayNone');
    document.getElementById('searchInput').value = '';
};

document.getElementById('folders').addEventListener('click', showFolder);
document.getElementById('backIcon').addEventListener('click', hideFolder);