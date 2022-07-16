import { Socket } from "socket.io";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";
import { events } from "../apiConfig.json"
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { CourseService } from "../services/sigaa-api/Course.service";

export class News {
    constructor(private socketService: Socket) {}
    async list(query: {
        cache: boolean,
        registration: string,
        inactive: boolean,
        allPeriods: boolean,
        fullNews: boolean,
        code: string,
    }) {
        const eventName = events.homeworks.specific;
        const apiEventError = events.api.error;
        try {

            const { cache, uniqueID } = cacheUtil.restore(this.socketService.id);
            const { JSESSIONID, jsonCache } = cache
            if (query.cache) {
                const newest = cacheHelper.getNewest(jsonCache, query)
                if (newest) {
                    return this.socketService.emit(eventName, JSON.stringify(newest["BondsJSON"]))
                }
            }
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(JSESSIONID)
            const accountService = new AccountService(account)
            const activeBonds = await accountService.getActiveBonds();
            const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
            const bonds = [...activeBonds, ...inactiveBonds];
            const bond = bonds.find(bond => bond.registration === query.registration);

            const bondService = new BondService(bond)
            const period = await bondService.getCurrentPeriod()
            const courses = await bondService.getCourses();
            const course = courses.find(course => course.code === query.code);
            const courseService = new CourseService(course)
            const newsList = await courseService.getNews()
            const news = await News.parser(newsList, query.fullNews)
            const courseJSON = Courses.parser({ course, news })
            const bondJSON = Bonds.parser({ bond, CoursesJSON: [courseJSON], period });
            cacheHelper.storeCache(uniqueID, { jsonCache: [{ BondsJSON: [bondJSON], query, time: new Date().toISOString() }], time: new Date().toISOString() })
            return this.socketService.emit(eventName, bondJSON);
        } catch (error) {
            console.error(error);
            this.socketService.emit(apiEventError, error.message)
            return false;
        }
    }

    static async parser(newsList: any[], full?: boolean) {
        const newsJSON = [];
        for (const news of newsList) {
            newsJSON.push({
                id: news.id,
                title: news.title,
                description: full ? await news.getContent() : "",
                date: full ? (await news.getDate()).toISOString() : "",
            });
        }
        return newsJSON;
    }
}