export const formatTime = (
	milliseconds: number,
	withSeconds: boolean = true
) => {
	const seconds = Math.floor(milliseconds / 1000);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	return `${hours.toString().padStart(2, '0')}:${minutes
		.toString()
		.padStart(2, '0')}${
		withSeconds ? `:${remainingSeconds.toString().padStart(2, '0')}` : ''
	}`;
};

export const formatDate = (milliseconds: number) => {
	const date = new Date(milliseconds);
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	const day = date.getDate();
	const month = months[date.getMonth()];
	const year = date.getFullYear();

	const startOfDay = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate()
	);
	const time = formatTime(date.getTime() - startOfDay.getTime(), false);

	return {
		date: `${day} ${month} ${year}`,
		time: time,
	};
};
