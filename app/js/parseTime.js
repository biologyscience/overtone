function parseTime(ms)
{
    const round = ms > 0 ? Math.floor : Math.ceil;

	const data =
	{
		days: round(ms / 86400000),
		hours: round(ms / 3600000) % 24,
		minutes: round(ms / 60000) % 60,
		seconds: round(ms / 1000) % 60
	};

	return data;
};

module.exports = parseTime;