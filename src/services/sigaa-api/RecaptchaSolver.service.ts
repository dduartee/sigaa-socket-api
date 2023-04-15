import { spawn } from "node:child_process";

const recaptchaSolver = async (sitekey: string, action: string) => {
	const process = spawn("python3", [__dirname + "/Recaptcha/bypass.py", sitekey, action]);
	return new Promise<string>((resolve, reject) => {
		process.stdout.on("data", (data) => {
			resolve(data.toString());
		});
		process.stderr.on("data", (data) => {
			console.error(data.toString());
			reject(data.toString());
		});
	});

};
export { recaptchaSolver };