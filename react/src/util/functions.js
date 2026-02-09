function parseTime(sec)
{
    const round = sec > 0 ? Math.floor : Math.ceil;

	const data =
	{
		days: round(sec / (24 * 60 * 60)),
		hours: round(sec / (60 * 60)) % 24,
		minutes: round(sec / (60)) % 60,
		seconds: round(sec % 60),
		text: '',
	};

	const seconds = data.seconds.toString().padStart(2, '0');

	data.text = data.hours > 0 ? `${data.hours}:${data.minutes.toString().padStart(2, '0')}:${seconds}` : `${data.minutes}:${seconds}`;

	return data;
};

function getTextColor(background)
{
	const rgb = background
	.replace('#', '')
	.match(/.{2}/g)
	.map(x => parseInt(x, 16))
	.map((y) =>
	{
		y /= 255;

		if (y > 0.03928) return Math.pow((y + 0.055) / 1.055, 2.4)

		return y / 12.92;
	})

	const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]

	return luminance > 0.5 ? '#000000' : '#ffffff'
}

export { parseTime, getTextColor };