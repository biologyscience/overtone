const { readFileSync, writeFileSync, existsSync } = require('fs');
const path = require('path');
const sharp = require('sharp');

const itunes = require('./itunes');

const appdata =
{
    get(filename) { return JSON.parse(readFileSync(path.join(__dirname, `./appdata/${filename}.json`))); },
    set(filename, data) { return writeFileSync(path.join(__dirname, `./appdata/${filename}.json`), JSON.stringify(data, null, 4)); }
}

function parseTime(sec)
{
    const round = sec > 0 ? Math.floor : Math.ceil;

	const data =
	{
		days: round(sec / (24 * 60 * 60)),
		hours: round(sec / (60 * 60)) % 24,
		minutes: round(sec / (60)) % 60,
		seconds: round(sec % 60),
		text: ''
	};

	const seconds = data.seconds.toString().padStart(2, '0');

	data.text = data.hours > 0 ? `${data.hours}:${data.minutes.toString().padStart(2, '0')}:${seconds}` : `${data.minutes}:${seconds}`;

	return data;
};

class M3U
{
	constructor({name, songs})
	{
		this.name = name;
		this.songs = new Set(songs);
	}

	parse(string)
	{
		let text = string;

		if (existsSync(string)) text = readFileSync(string, { encoding: 'utf8' });

		const lines = text.split('\n');

		this.name = lines.find(x => x.startsWith('#PLAYLIST:'))?.split(':')?.pop();
		this.songs = new Set(lines.filter(x => !x.startsWith('#')).map(y => y.split('/').pop().split('\\').pop()));

		return this;
	}

	addSong(filename)
	{
		if (filename) this.songs.add(filename);

		return this;
	}

	removeSong(filename)
	{
		if (filename) this.songs.delete(filename);

		else
		{
			const songs = [...this.songs];
			songs.pop();

			this.songs = new Set(songs);
		}

		return this;
	}

	toString() { return ['#EXTM3U', `#PLAYLIST:${this.name}`, ...this.songs].join('\n'); }

	saveToFile(filepath)
	{
		if (!filepath) return;

		writeFileSync(filepath, this.toString(), { encoding: 'utf8' });
	}
}

async function saveArtistPicture(term, ID)
{
	const artistURL = await itunes.getArtistURL(term);

	if (artistURL === null) return;

	const pictureURL = await itunes.getArtistPicture(artistURL);
	const buffer = await itunes.bufferFromURL(pictureURL);

	sharp(buffer).toFile(path.join(__dirname, `./appdata/webp/${ID}.webp`));
}

module.exports = { appdata, parseTime, M3U, saveArtistPicture };