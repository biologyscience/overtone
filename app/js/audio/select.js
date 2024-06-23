function select({target})
{
    if (target.localName === 'ul') return;
    
    const
        { album, albumArtist } = util.read.metadata()[target.dataset.fileLocation],
        position = parseInt(target.dataset.position);

    document.dispatchEvent(new CustomEvent('-selectedAlbum', {detail: {album, albumArtist, position}}));
};

document.getElementById('songListInAlbum').addEventListener('click', select);