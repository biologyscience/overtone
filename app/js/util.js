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
    const dataURL = 'data:' + format + ';base64,' + buffer?.toString('base64');

    return dataURL;
};

function getAudioDuration(fileLocation)
{
    return new Promise((resolve) =>
    {
        const audio = document.createElement('audio');
    
        audio.src = fileLocation;
    
        audio.onloadeddata = () => resolve(parseTime(audio.duration * 1000));
    });
};

function getElement(localName, obj)
{
    let foundElement;

    if (obj?.localName === localName) { foundElement = obj; }

    else if (obj?.detail?.localName === localName) { foundElement = obj.detail; }

    else { obj?.path?.forEach(x => x.localName === localName ? foundElement = x : null); }

    return foundElement;
}

//

module.exports =
{
    formatter,
    parseTime,
    buffer2DataURL,
    getAudioDuration,
    getElement
};