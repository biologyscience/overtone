function formatter(albumName, albumArtist = '')
{
    const md5 = crypto.createHash('md5');

    md5.update(`${albumName}_${albumArtist}`);

    return md5.digest('hex');
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

    data.ms = ms;

	return data;
};

function getFileSize(fileLocation)
{
    const byte = fs.statSync(fileLocation).size;

    const round = byte > 0 ? Math.floor : Math.ceil;

	const data =
	{
		gb: round(byte / (1024 * 1024 * 1024)) % 1024,
		mb: round(byte / (1024 * 1024)) % 1024,
		kb: round(byte / 1024) % 1024,
		byte
	};

	return data;
};

function buffer2DataURL(format, buffer)
{
    const dataURL = `data:${format};base64,${buffer?.toString('base64')}`;

    return dataURL;
};

function getAudioDuration(fileLocation)
{    
    return new Promise((resolve) =>
    {
        musicMetadata.parseFile(fileLocation, {skipCovers: true, skipPostHeaders: true}).then((result) =>
        {
            const ms = result.format.duration * 1000;

            resolve(parseTime(ms));
        });
    });
};

function getElement(localName, obj)
{
    let foundElement;

    if (obj?.localName === localName) { foundElement = obj; }

    else if (obj?.detail?.localName === localName) { foundElement = obj.detail; }

    else { obj?.composedPath()?.forEach(x => x.localName === localName ? foundElement = x : null); }

    return foundElement;
};

function getAlbumArt(fileLocation)
{
    return new Promise((resolve) =>
    {
        musicMetadata.parseFile(fileLocation, {skipPostHeaders: true}).then((tags) =>
        {
            const picture = tags.common?.picture?.[0];

            const obj =
            {
                format: picture?.format,
                buffer: picture?.data,
                URL: buffer2DataURL(picture?.format, picture?.data)
            };

            resolve(obj);
        });
    });
};

function getMetaData(fileLocation)
{
    return new Promise((resolve) =>
    {
        musicMetadata.parseFile(fileLocation, {skipCovers: true, skipPostHeaders: true}).then((tags) =>
        {
            const { album, albumartist, artists, bpm, disk, genre, title, track, year } = tags.common;

            const
                time = parseTime(tags.format.duration * 1000),
                hours = time.hours,
                minutes = time.minutes,
                seconds = time.seconds.toString().length > 1 ? time.seconds : `0${time.seconds}`;
            
            let duration;

            time.hours > 0 ? duration = `${hours}:${minutes}:${seconds}` : duration = `${minutes}:${seconds}`;

            resolve
            ({
                album,
                albumArtist: albumartist,
                artists,
                bpm,
                disk,
                genre,
                title,
                track,
                year,
                duration,
                rawDuration: Math.floor(tags.format.duration * 1000)
            });
        });
    });
};

function getAudioInfo(fileLocation)
{
    return new Promise((resolve) =>
    {
        musicMetadata.parseFile(fileLocation, {skipCovers: true, skipPostHeaders: true}).then((result) =>
        {
            const { bitrate, codec, duration, lossless, numberOfChannels, sampleRate } = result.format;

            resolve
            ({
                bitrate: `${bitrate / 1000} kbps`,
                encoding: codec,
                sampleRate: `${sampleRate} Hz`,
                channelType: numberOfChannels === 2 ? 'Stereo' : 'Mono',
                lossless,
                duration: { parsed: parseTime(duration * 1000), rawSeconds: duration },
                fileSize: getFileSize(fileLocation)
            });
        });
    });
};

class json
{
    constructor(fileLocation)
    {
        this.fileLocation = fileLocation;
        this.readFileSync = fs.readFileSync;
        this.writeFileSync = fs.writeFileSync;
    };

    read()
    {
        const json = this.readFileSync(this.fileLocation);

        this.json = JSON.parse(json);

        return this.json;
    };


    save()
    {
        const json = JSON.stringify(this.json, null, 4);

        this.writeFileSync(this.fileLocation, json);
    };
};

const read =
{
    albums() { return JSON.parse(fs.readFileSync('app/json/albums.json')); },
    artists() { return JSON.parse(fs.readFileSync('app/json/artists.json')); },
    config() { return JSON.parse(fs.readFileSync('app/json/config.json')); },
    metadata() { return JSON.parse(fs.readFileSync('app/json/metadata.json')); },
    queues() { return JSON.parse(fs.readFileSync('app/json/queues.json')); },
    songList() { return JSON.parse(fs.readFileSync('app/json/songList.json')); }
};

function validateMusicFileFormat(fileLocation)
{
    const validator = /\.(mp3|flac|ogg)$/i;

    return validator.test(fileLocation);
};

const sort = 
{
    byTrackNumber(x, y)
    {
        const
            trackNumberX = read.metadata()[x].track.no,
            trackNumberY = read.metadata()[y].track.no;

        return trackNumberX - trackNumberY;
    }
};

function fractionToPercent(frac, fixed)
{
    if (frac > 1) { return '100%'; }

    if (0 > frac) { return '0%'; }

    if (1 > frac && frac > 0) { return `${(frac * 100).toFixed(fixed)}%`; }
};

function internet()
{
    return new Promise((solve) =>
    {
        let connection = true;

        require('dns/promises')
        .lookup('www.google.com')
        .catch(() => connection = false)
        .finally(() => solve(connection));
    });
};

module.exports =
{
    formatter,
    parseTime,
    getFileSize,
    buffer2DataURL,
    getAudioDuration,
    getElement,
    getAlbumArt,
    getMetaData,
    getAudioInfo,
    json,
    read,
    validateMusicFileFormat,
    sort,
    fractionToPercent,
    internet
};