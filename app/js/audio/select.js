function select({target})
{
    if (target.localName === 'ul') return;
    
    const
        { album, albumArtist } = util.read.metadata()[target.dataset.fileLocation],
        position = parseInt(target.dataset.position);

    document.dispatchEvent(new CustomEvent('-selectedAlbum', {detail: {album, albumArtist, position}}));
};

function selectAlbum()
{
    const
        album = document.querySelector('section.album .in .head .content .name').innerHTML,
        albumArtist = document.getElementById('albumArtistInAlbumItem').innerHTML;
    
    document.dispatchEvent(new CustomEvent('-selectedAlbum', {detail: {album, albumArtist, position: 0}}));
};

document.getElementById('songListInAlbum').addEventListener('click', select);
document.querySelector('section.album .in .head .albumArt').addEventListener('click', selectAlbum);
document.getElementById('artistPicture').addEventListener('click', (E) => document.dispatchEvent(new CustomEvent('-selectedArtist', {detail: E.target.dataset.artistName})));