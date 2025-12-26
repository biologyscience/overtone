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

export { parseTime };