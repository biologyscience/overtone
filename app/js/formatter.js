const allowedChars = 'abcdefghijklmnopqrstuvwxyz_-0123456789'.split('');

const replaceWith = '-';

function formatter(albumName, albumArtist)
{
    const array = 
    {
        albumName: albumName.toLowerCase().split(' ').join('_').split(''),
        albumArtist: albumArtist.toLowerCase().split(' ').join('_').split('')
    };

    array.albumName.forEach(x => allowedChars.includes(x) ? null : array.albumName[array.albumName.indexOf(x)] = replaceWith);
    array.albumArtist.forEach(x => allowedChars.includes(x) ? null : array.albumArtist[array.albumArtist.indexOf(x)] = replaceWith);

    return array.albumName.join('') + '_' + array.albumArtist.join('');
};

module.exports = formatter;