import { Account, InstitutionType, Page, Sigaa } from "sigaa-api";
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
    public async loginWithCredentials(credentials, sigaaInstance: Sigaa) {
        const attemptLogin = await this.attemptLogin(credentials, sigaaInstance)
        if (attemptLogin.page) {
            const attemptGetAccount = await this.attemptGetAccount(attemptLogin.page, sigaaInstance)
            if (attemptGetAccount.account) {
                const JSESSIONID = attemptLogin.page.requestHeaders.Cookie 
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
        if(!JSESSIONID) throw new Error("JSESSIONID is required")
        /**
         * Injeta o JSESSIONID no Sigaa
         */
        const { url, institution } = options
        const { pageCache, pageCacheWithBond } = Builder.getPagesCache(100)
        const httpSession = Builder.getHTTPSession(url, JSESSIONID, pageCache)
        const httpFactory = Builder.getHTTPFactory(url, JSESSIONID, pageCacheWithBond, httpSession)
        const http = httpFactory.createHttp()
        const parser = Builder.getSIGAAParser()
        const bondFactory = Builder.getBondFactory(http, httpFactory, parser)
        const accountFactory = Builder.getAccountFactory(http, parser, bondFactory, institution)
        const page = await http.get('/sigaa/vinculos.jsf')
        const account = await accountFactory.getAccount(page)
        return { account, page, httpSession, pageCache, pageCacheWithBond }
    }
}

export default new AuthenticationService()