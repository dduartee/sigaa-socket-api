const recaptchaSolver = async (siteKey: string, dataAction: string) => {
	const { data } = await fetch(`${process.env.RECAPTCHA_SOLVER_URL}/solve/${siteKey}/${dataAction}`).then((res) => res.json());
	return data;
};

export { recaptchaSolver };