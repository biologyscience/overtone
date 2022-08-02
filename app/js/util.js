function formatter(albumName, albumArtist)
{
    const
        allowedChars = 'abcdefghijklmnopqrstuvwxyz_-0123456789'.split(''),
        replaceWith = '-';

    const array = 
    {
        albumName: albumName.toLowerCase().split(' ').join('_').split(''),
        albumArtist: albumArtist.toLowerCase().split(' ').join('_').split('')
    };

    array.albumName.forEach(x => allowedChars.includes(x) ? null : array.albumName[array.albumName.indexOf(x)] = replaceWith);
    array.albumArtist.forEach(x => allowedChars.includes(x) ? null : array.albumArtist[array.albumArtist.indexOf(x)] = replaceWith);

    return array.albumName.join('') + '_' + array.albumArtist.join('');
};

function parseTime(ms)
{
    const round = ms > 0 ? Math.floor : Math.ceil;

	const data =
	{
		days: round(ms / (24 * 60 * 60 * 1000)),
		hours: round(ms / (60 * 60 * 1000)) % 24,
		minutes: round(ms / (60 * 1000)) % 60,
		seconds: round(ms / 1000) % 60
	};

	return data;
};

function buffer2DataURL(format, buffer)
{
    return 'data:' + format + ';base64,' + buffer?.toString('base64');
};

//

module.exports =
{
    formatter,
    parseTime,
    buffer2DataURL
};