import { CourseStudent, StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../api/BondSIGAA";
import { CourseSIGAA } from "../api/CourseSIGAA";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Grades } from "./Grades";
import { Homeworks } from "./Homeworks";
import { News } from "./News";

export class Courses {
    event: {
        list: {
            name: string
        }
    }
    constructor() {
        this.event = {
            list: {
                name: "courses::list"
            }
        }
    }
    /**
     * Lista matérias de um vinculo especificado pelo registration
     * @param params socket
     * @param received registration 
     * @returns 
     */
    async list(params: { socket: Socket }, received: jsonCache["received"]) {
        try {
            const { socket } = params;
            const { list } = this.event;
            const eventName = list.name;

            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            console.log(received);
            if (received.cache) {
                const newest = cacheHelper.getNewest(jsonCache, received)
                if (newest) {
                    return socket.emit(eventName, JSON.stringify(newest["BondsJSON"]))
                }
            }

            const bonds = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];
            for (const bond of bonds) {
                if (bond.registration == received.registration) {
                    const courses = await new CourseSIGAA().getCourses(bond);
                    const CoursesJSON = [];
                    for (const course of courses) {
                        CoursesJSON.push(Courses.parser({ course }))
                    }
                    BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                    cacheHelper.storeCache(uniqueID, { account, jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() })
                    return socket.emit(eventName, JSON.stringify(BondsJSON));
                }
            }
        } catch (error) {
            console.error(error)
            return false;
        }
    }
    /**
     * Parser da matéria
     * @param params 
     * @returns 
     */
    static parser(params: { course: CourseStudent, news?: any, grades?: any, homeworks?: any }) {
        const { course, grades, homeworks, news } = params;
        return {
            id: course.id,
            title: course.title,
            code: course.code,
            period: course.period,
            schedule: course.schedule,
            news: news ?? [],
            grades: grades ?? [],
            homeworks: homeworks ?? []
        };
    }
}