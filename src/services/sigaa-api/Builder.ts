import {
    SigaaPageCache,
    SigaaCookiesController,
    SigaaBondController,
    SigaaHTTPSession,
    SigaaHTTPFactory,
    SigaaActivityFactory,
    SigaaBondFactory,
    SigaaCourseFactory,
    SigaaCourseResourceManagerFactory,
    SigaaCourseResourcesFactory,
    SigaaLessonParserFactory,
    SigaaParser,
    HTTP,
    SigaaAccountFactory,
    SigaaSession,
    BondFactory,
    InstitutionType,
    Parser
} from 'sigaa-api'
import { SigaaPageCacheFactory } from 'sigaa-api/dist/session/sigaa-page-cache-factory'
import { SigaaPageCacheWithBond } from 'sigaa-api/dist/session/sigaa-page-cache-with-bond'
import { URL } from 'url'

export type JSESSIONID = string;
class SigaaAPIBuilder {
    /**
     * Gera as páginas de cache
     * @returns pageCache, pageCacheWithBond
     */
    private getPagesCache() {
        const timeoutCache = 15 * 1000
        const pageCacheFactory = new SigaaPageCacheFactory()
        const pageCacheWithBond = new SigaaPageCacheWithBond(pageCacheFactory, timeoutCache)
        const pageCache = new SigaaPageCache(timeoutCache)
        return { pageCache, pageCacheWithBond }
    }

    /**
     * Gera o httpSession com o cookie
     * @param url string
     * @param cookie JSESSIONID
     * @param pageCache SigaaPageCache
     * @returns httpSession
     */
    private getHTTPSession(url: string, cookie: JSESSIONID, pageCache: SigaaPageCache) {
        const cookiesController = new SigaaCookiesController()
        const { hostname } = new URL(url)
        const cookiesControllerInjected = this.injectCookies(hostname, cookie, cookiesController)
        return new SigaaHTTPSession(url, cookiesControllerInjected, pageCache)
    }

    /**
     * Injeta o cookie no cookiesController
     * @param hostname string
     * @param cookie JSESSIONID
     * @param cookiesController SigaaCookiesController
     * @returns CookiesController injected with the cookie
     */
    private injectCookies(hostname: string, cookie: JSESSIONID, cookiesController: SigaaCookiesController) {
        cookiesController.storeCookies(hostname, [cookie])
        return cookiesController
    }

    /**
     * Gera o bondController
     * @returns SigaaBondController
     */
    private getBondController() {
        return new SigaaBondController()
    }

    /**
     * Gera o SigaaParser
     * @returns SigaaParser
     */
    public getSIGAAParser() {
        return new SigaaParser()
    }

    /**
     * Gera o courseFactory
     * @param parser SigaaParser
     * @param http HTTP
     * @returns courseFactory
     */
    private getCourseFactory(parser: SigaaParser, http: HTTP) {
        const courseResourcesManagerFactory = this.getCoursesResourcesManagerFactory(parser)
        const lessonParserFactory = new SigaaLessonParserFactory(parser)
        const courseFactory = new SigaaCourseFactory(
            http,
            parser,
            courseResourcesManagerFactory,
            lessonParserFactory
        )
        return courseFactory
    }

    /**
     * Gera o courseResourceManagerFactory
     * @param parser SigaaParser
     * @returns coursesResourcesManagerFactory
     */
    private getCoursesResourcesManagerFactory(parser: SigaaParser) {
        const courseResourcesFactory = new SigaaCourseResourcesFactory(parser)
        const courseResourcesManagerFactory = new SigaaCourseResourceManagerFactory(
            courseResourcesFactory
        )
        return courseResourcesManagerFactory
    }

    /**
     * Gera o bondFactory
     * @param http HTTP
     * @param httpFactory SigaaHTTPFactory
     * @returns parser, bondFactory
     */
    public getBondFactory(http: HTTP, httpFactory: SigaaHTTPFactory, parser: SigaaParser) {
        const courseFactory = this.getCourseFactory(parser, http)
        const activityFactory = new SigaaActivityFactory()
        const bondFactory = new SigaaBondFactory(
            httpFactory,
            parser,
            courseFactory,
            activityFactory
        )
        return bondFactory
    }

    /**
     * Gera o httpFactory
     * @param url string
     * @param cookie JSESSIONID
     * @returns httpFactory
     */
    public getHTTPFactory(url: string, cookie: JSESSIONID) {
        const { pageCache, pageCacheWithBond } = this.getPagesCache()
        const httpSession = this.getHTTPSession(url, cookie, pageCache)
        const bondController = this.getBondController()
        const httpFactory = new SigaaHTTPFactory(
            httpSession,
            pageCacheWithBond,
            bondController
        )
        return httpFactory
    }

    public getAccountFactory(
        http: HTTP,
        parser: Parser,
        bondFactory: BondFactory,
        institution: InstitutionType
    ) {
        const Session = new SigaaSession(institution)
        const sigaaAccountFactory = new SigaaAccountFactory(
            http,
            parser,
            Session,
            bondFactory
        )
        return sigaaAccountFactory
    }
}

export default new SigaaAPIBuilder()
