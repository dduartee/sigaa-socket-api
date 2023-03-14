class LoggerService {
	log(message: string, data?: unknown) {
		const date = new Date();
		const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
		console.log(`[${time}] ${message}`, data);
		return;
	}
}

export default new LoggerService();