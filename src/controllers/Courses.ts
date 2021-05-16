import { CourseStudent, StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../api/BondSIGAA";
import { CourseSIGAA } from "../api/CourseSIGAA";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { CacheController } from "./Cache";

export class Courses {
    /**
     * Lista matéria especificada pelo code
     * @param params socket
     * @param received code
     * @returns 
     */
    async specific(params: { socket: Socket }, received: jsonCache["received"]) {
        try {
            const { socket } = params;
            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            const newest = CacheController.getNewest(jsonCache, received)
            if (newest) {
                return socket.emit("courses::specific", JSON.stringify(newest["BondsJSON"]))
            }
            const bonds = cache.rawCache.bonds ?? await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];
            const rawCourses = [];
            for (const [pos, bond] of (bonds).entries()) {
                const CoursesJSON = [];
                const courses = await new CourseSIGAA().getCourses(bond);
                rawCourses[pos] = [];
                rawCourses[pos].push(courses)
                for (const course of rawCourses[pos]) {
                    if (course.code == received.code) {
                        CoursesJSON.push(Courses.parser({ course }))
                        BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                        CacheController.storeCache(uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], rawCache: { courses: rawCourses }, time: new Date().toISOString() })
                        return socket.emit("courses::specific", JSON.stringify(BondsJSON));
                    }
                }
            }
            return socket.emit("courses::status", "Nothing found with code: " + received.code)

        } catch (error) {
            console.error(error);
            return false;
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
            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            const newest = CacheController.getNewest(jsonCache, received)
            if (newest) {
                return socket.emit("courses::list", JSON.stringify(newest["BondsJSON"]))
            }
            const bonds = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];
            for (const [pos, bond] of (bonds).entries()) {
                if (bond.registration == received.registration) {
                    const courses = await new CourseSIGAA().getCourses(bond);
                    const CoursesJSON = [];
                    for (const course of courses) {
                        CoursesJSON.push(Courses.parser({ course }))
                    }
                    BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                }
            }
            CacheController.storeCache(uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() })
            return socket.emit("courses::specific", JSON.stringify(BondsJSON));
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