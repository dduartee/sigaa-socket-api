import { Account, Page, Sigaa, SigaaCookiesController } from "sigaa-api";
import RequestStackCache, { IRequestStackCache } from "../cache/RequestStackCache";
const expectedErrors = [
	"SIGAA: Invalid response after login attempt.",
	"SIGAA: Invalid homepage, the system behaved unexpectedly.",
	"SIGAA: Unknown homepage format."
];
type CredentialsType = {
	username: string;
	password: string;
}
class AuthenticationService {
	private async attemptLogin(credentials: {
		username: string;
		password: string;
	}, sigaaInstance: Sigaa): Promise<{ page: Page; error: undefined } | { page: undefined, error: string }> {
		try {
			const page = await sigaaInstance.loginInstance.login(credentials.username, credentials.password);
			return { page, error: undefined };
		} catch (primaryError: any) {
			let errorMessage = primaryError.message as string;
			let counter = 1;
			while (expectedErrors.includes(errorMessage)) {
				if (counter > 5) {
					return { page: undefined, error: errorMessage };
				}
				try {
					sigaaInstance.session.loginStatus = 0;
					const retryPage = await sigaaInstance.loginInstance.login(credentials.username, credentials.password);
					return { page: retryPage, error: undefined };
				} catch (secondaryError: any) {
					errorMessage = secondaryError.message;
					counter++;
				}
			}
			return { page: undefined, error: errorMessage };
		}
	}
	private async attemptGetAccount(
		page: Page,
		sigaaInstance: Sigaa
	): Promise<{ account: Account; error: undefined } | { account: undefined, error: string }> {
		const http = sigaaInstance.httpFactory.createHttp();
		try {
			const account = await sigaaInstance.accountFactory.getAccount(page);
			return { account, error: undefined };
		} catch (primaryError: any) {
			let errorMessage = primaryError.message;
			let counter = 1;
			while (expectedErrors.includes(errorMessage)) {
				if (counter > 5) {
					return { account: undefined, error: errorMessage };
				}
				try {
					const retryPage = await http.followAllRedirect(await http.get(page.url.href, { noCache: true }), { noCache: true });
					const account = await sigaaInstance.accountFactory.getAccount(retryPage);
					errorMessage = undefined;
					return { account, error: errorMessage };
				} catch (secondaryError: any) {
					errorMessage = secondaryError.message;
					counter++;
				}
			}
			return { account: undefined, error: errorMessage };
		}
	}
	public async loginWithCredentials(credentials: CredentialsType, sigaaInstance: Sigaa) {
		const attemptLogin = await this.attemptLogin(credentials, sigaaInstance);
		if (!attemptLogin.page) throw new Error(attemptLogin.error);

		const attemptGetAccount = await this.attemptGetAccount(attemptLogin.page, sigaaInstance);
		if (!attemptGetAccount.account) throw new Error(attemptGetAccount.error);

		const JSESSIONID = attemptLogin.page.requestHeaders.Cookie;
		return { account: attemptGetAccount.account, JSESSIONID: JSESSIONID };
	}
	/**
	 * @param sigaaInstance Instância do SIGAA já rehydratada
	 * @returns Classe Account do SIGAA
	 */
	public async loginWithJSESSIONID(sigaaInstance: Sigaa) {
		const http = sigaaInstance.httpFactory.createHttp();
		return await http.get("/sigaa/vinculos.jsf");
	}
	public async parseAccount(sigaaInstance: Sigaa, page: Page) {
		return await sigaaInstance.accountFactory.getAccount(page);
	}

	/**
	 * @param sigaaURL URL do SIGAA da instituição
	 * @param JSESSIONID Cookie JSESSIONID do SIGAA
	 * @returns Instância do SIGAA com os cookies e o requestStackController reutilizados
	 */
	public getRehydratedSigaaInstance(sigaaURL: string, JSESSIONID: string) {
		const {hostname, href} = new URL(sigaaURL);
		const cookiesController = new SigaaCookiesController();
		cookiesController.storeCookies(hostname, [JSESSIONID]);
		const requestStackController = RequestStackCache.get<IRequestStackCache>(JSESSIONID);
		if (!requestStackController) throw new Error("RequestStackController not found");
		const sigaaInstance = new Sigaa({ url: href, cookiesController, requestStackController });
		return sigaaInstance;
	}
}

export default new AuthenticationService();