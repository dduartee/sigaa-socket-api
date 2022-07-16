import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";
import { events } from "../apiConfig.json"
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { CourseService } from "../services/sigaa-api/Course.service";
import { Socket } from "socket.io";
export class Homeworks {
    constructor(private socketService: Socket) {}
    /**
     * Lista homeworks de todas as matérias de um vinculo especificado pelo registration
     * @param params 
     * @param query 
     * @returns 
     */
    async list(query: {
        inactive: boolean,
        allPeriods: boolean,
        cache: boolean,
        registration: string,
        fullHW: boolean,
    }) {
        const eventName = events.homeworks.list;
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
            const bond = bonds.find(b => b.registration === query.registration);
            const bondService = new BondService(bond)
            const period = await bondService.getCurrentPeriod()
            const CoursesJSON = [];
            const courses = await bondService.getCourses();
            for (const course of courses) {
                const courseService = new CourseService(course)
                const homeworksList: any = await courseService.getHomeworks()
                const homeworks = await Homeworks.parser(homeworksList, query.fullHW);
                CoursesJSON.push(Courses.parser({ course, homeworks }))
                this.socketService.emit("homeworks::listPartial", Bonds.parser({ bond, CoursesJSON, period }))
            }
            const bondJSON = Bonds.parser({ bond, CoursesJSON, period });
            httpSession.close()
            cacheHelper.storeCache(uniqueID, { jsonCache: [{ BondsJSON: [bondJSON], query, time: new Date().toISOString() }], time: new Date().toISOString() })
            return this.socketService.emit(eventName, bondJSON);

        } catch (error) {
            console.error(error);
            this.socketService.emit(apiEventError, error.message)
            return false;
        }
    }
    static async parser(homeworkList: any[], full?: boolean) {
        const homeworks = [];
        for (const homework of homeworkList) {
            const description = full ? (await homework.getDescription()) : null;
            const haveGrade = full ? (await homework.getFlagHaveGrade()) : null;
            const isGroup = full ? (await homework.getFlagIsGroupHomework()) : null;
            const startDate = homework.startDate;
            const endDate = homework.endDate;
            const title = homework.title;
            homeworks.push({
                title,
                description,
                startDate,
                isGroup,
                endDate,
                haveGrade,
            });
        }
        return homeworks;
    }
}