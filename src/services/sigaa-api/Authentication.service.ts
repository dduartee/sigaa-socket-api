import { Account, InstitutionType, Page, Request, Sigaa, SigaaCookiesController } from "sigaa-api";
import { SigaaRequestStack } from "sigaa-api/dist/helpers/sigaa-request-stack";
import { cacheService } from "../cacheService";
import Builder, { JSESSIONID } from "./Builder";
const expectedErrors = [
    'SIGAA: Invalid response after login attempt.',
    'SIGAA: Invalid homepage, the system behaved unexpectedly.',
    'SIGAA: Unknown homepage format.'
]
class AuthenticationService {
    private async attemptLogin(credentials: {
        username: string;
        password: string;
    }, sigaaInstance: Sigaa): Promise<{ page: Page; error: undefined } | { page: undefined, error: string }> {
        try {
            const page = await sigaaInstance.loginInstance.login(credentials.username, credentials.password)
            return { page, error: undefined }
        } catch (primaryError: any) {
            let errorMessage = primaryError.message as string
            let counter = 1
            while (expectedErrors.includes(errorMessage)) {
                if (counter > 5) {
                    return { page: undefined, error: errorMessage }
                }
                try {
                    sigaaInstance.session.loginStatus = 0
                    const retryPage = await sigaaInstance.loginInstance.login(credentials.username, credentials.password)
                    return { page: retryPage, error: undefined }
                } catch (secondaryError: any) {
                    errorMessage = secondaryError.message
                    counter++
                }
            }
            return { page: undefined, error: errorMessage }
        }
    }
    private async attemptGetAccount(
        page: Page,
        sigaaInstance: Sigaa
    ): Promise<{ account: Account; error: undefined } | { account: undefined, error: string }> {
        const http = sigaaInstance.httpFactory.createHttp()
        try {
            const account = await sigaaInstance.accountFactory.getAccount(page)
            return { account, error: undefined }
        } catch (primaryError: any) {
            let errorMessage = primaryError.message
            let counter = 1
            while (expectedErrors.includes(errorMessage)) {
                if (counter > 5) {
                    return { account: undefined, error: errorMessage }
                }
                try {
                    const retryPage = await http.followAllRedirect(await http.get(page.url.href, { noCache: true }), { noCache: true })
                    const account = await sigaaInstance.accountFactory.getAccount(retryPage)
                    errorMessage = undefined
                    return { account, error: errorMessage }
                } catch (secondaryError: any) {
                    errorMessage = secondaryError.message
                    counter++
                }
            }
            return { account: undefined, error: errorMessage }
        }
    }
    public async loginWithCredentials(credentials, sigaaInstance: Sigaa, requestStackController: SigaaRequestStack<Request, Page>) {
        const attemptLogin = await this.attemptLogin(credentials, sigaaInstance)
        if (attemptLogin.page) {
            const attemptGetAccount = await this.attemptGetAccount(attemptLogin.page, sigaaInstance)
            if (attemptGetAccount.account) {
                const JSESSIONID = attemptLogin.page.requestHeaders.Cookie
                cacheService.set(`requestStackInstance@${JSESSIONID}`, requestStackController)
                return {
                    account: attemptGetAccount.account,
                    JSESSIONID
                }
            } else {
                throw new Error(attemptGetAccount.error)
            }
        } else {
            throw new Error(attemptLogin.error)
        }
    }
    public async loginWithJSESSIONID(JSESSIONID: JSESSIONID, options = {
        url: "https://sigaa.ifsc.edu.br",
        institution: "IFSC" as InstitutionType
    }) {
        /**
         * Injeta o JSESSIONID no Sigaa
         */
        const { url, institution } = options
        const cookiesController = new SigaaCookiesController()
        const { hostname } = new URL(url)
        cookiesController.storeCookies(hostname, [JSESSIONID])
        const requestStackController = cacheService.get(`requestStackInstance@${JSESSIONID}`) as SigaaRequestStack<Request, Page>
        const sigaaInstance = new Sigaa({ url, institution, cookiesController, requestStackController })
        const http = sigaaInstance.httpFactory.createHttp()
        const page = await http.get('/sigaa/vinculos.jsf')
        const account = await sigaaInstance.accountFactory.getAccount(page)
        return { account, page, httpSession: sigaaInstance.httpSession }
    }
}

export default new AuthenticationService()