const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

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
		seconds: round(sec % 60)
	};

	return data;
};

module.exports = { appdata, parseTime };