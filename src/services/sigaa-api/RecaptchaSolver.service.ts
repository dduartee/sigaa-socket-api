const recaptchaSolver = async (siteKey: string, dataAction: string) => {
	if (!process.env.RECAPTCHA_SOLVER_URL) 
		throw new Error("RECAPTCHA_SOLVER_URL is not defined");
	const { data } = await fetch(`http://${process.env.RECAPTCHA_SOLVER_URL}:8000/solve/${siteKey}/${dataAction}`).then((res) => res.json());
	return data;
};

export { recaptchaSolver };