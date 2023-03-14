class LoggerService {
	log(message: string) {
		const date = new Date();
		const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
		console.log(`[${time}] ${message}`);
		return;
	}
}

export default new LoggerService();