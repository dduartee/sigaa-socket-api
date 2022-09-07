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
import { NewsDTO } from "../DTOs/News.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO } from "../DTOs/Bond.DTO";

export class News {
    constructor(private socketService: Socket) { }
    async latest(query: {
        cache: boolean,
        registration: string,
        courseId: string,
        inactive: boolean,
        allPeriods: boolean,
    }) {
        const apiEventError = events.api.error;
        try {

            const { cache, uniqueID } = cacheUtil.restore(this.socketService.id);
            const { JSESSIONID, jsonCache } = cache
            if (!JSESSIONID) {
                throw new Error("API: No JSESSIONID found in cache.");
            }
            if (query.cache) {
                const newest = cacheHelper.getNewest(jsonCache, query)
                if (newest) {
                    const bond = newest["BondsJSON"].find(b => b.registration === query.registration)
                    return this.socketService.emit("news::latest", bond)
                }
            }
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(JSESSIONID)
            const accountService = new AccountService(account)
            const activeBonds = await accountService.getActiveBonds();
            const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
            const bonds = [...activeBonds, ...inactiveBonds];
            const bond = bonds.find(bond => bond.registration === query.registration);

            const bondService = new BondService(bond)
            // const period = await bondService.getCurrentPeriod()
            // const active = activeBonds.includes(bond);

            const courses = await bondService.getCourses();
            const coursesDTOs: CourseDTO[] = []
            for (const course of courses) {
                if (course.id === query.courseId) {
                    const courseService = new CourseService(course)
                    const [n1] = await courseService.getNews()
                    const content = await n1.getContent()
                    const date = await n1.getDate()
                    const newsDTO = new NewsDTO({
                        id: n1.id,
                        title: n1.title,
                        content,
                        date,
                    })
                    httpSession.close()
                    const courseDTO = new CourseDTO(course, { newsDTOs: [newsDTO] })
                    return this.socketService.emit("news::latest", courseDTO.toJSON())
                    /*
                    coursesDTOs.push(courseDTO)
                    const bondDTO = new BondDTO(bond, active, period, { coursesDTOs })
                    const bondJSON = bondDTO.toJSON();
                    cacheHelper.storeCache(uniqueID, { jsonCache: [{ BondsJSON: [bondJSON], query, time: new Date().toISOString() }], time: new Date().toISOString() })
                    */
                }
            }
        } catch (error) {
            console.error(error);
            this.socketService.emit(apiEventError, error.message)
            return false;
        }
    }
}