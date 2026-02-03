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

function songInfoSetter(filepath, setSongInfo, setShowModal)
{
	window.ipc.invoke('ipc-wantInfo', filepath).then((data) =>
	{
		setSongInfo(data);
		setShowModal(true);
	});
}

export { parseTime, songInfoSetter };