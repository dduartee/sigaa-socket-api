import { CourseStudent, StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../api/BondSIGAA";
import { CourseSIGAA } from "../api/CourseSIGAA";
import { cacheUtil } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { CacheController } from "./Cache";

export class Courses {
    async specific(params: { socket: Socket }, received: { code: string }) {
        try {
            const { socket } = params;
            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            const newest: any = jsonCache ? CacheController.sortByDate(jsonCache) : []
            if (newest.received?.code == received.code) { // se no cache as options for igual
                return socket.emit("courses::specific", JSON.stringify(newest["BondsJSON"]))
            }
            const allbonds: StudentBond[][] = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = []
            for (const bonds of allbonds) for (const bond of bonds) {
                const CoursesJSON = [];
                const courses = await new CourseSIGAA().getCourses(bond);
                for (const course of courses) {
                    if (course.code == received.code) {
                        CoursesJSON.push(Courses.parser({ course }))
                        BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                        CacheController.storeCache(uniqueID, { jsonCache: [{ BondsJSON, time: new Date().toISOString(), received }] })
                        return socket.emit("courses::specific", JSON.stringify(BondsJSON));
                    }
                }
            }

        } catch (error) {
            console.error(error);
            return false;
        }
    }
    async list(params: { socket: Socket }, received: { registration: string }) {
        try {
            const { socket } = params;
            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            const newest: any = jsonCache ? CacheController.sortByDate(jsonCache) : []
            if (newest.received?.registration == received.registration) { // se no cache as options for igual
                return socket.emit("courses::list", JSON.stringify(newest["BondsJSON"]))
            }
            const allbonds: StudentBond[][] = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];
            for (const bonds of allbonds) for (const bond of bonds) {
                console.log(bond.program)
                const CoursesJSON = [];
                const courses = await new CourseSIGAA().getCourses(bond);
                if (bond.registration == received.registration) {
                    for (const course of courses) {
                        CoursesJSON.push(Courses.parser({ course }));
                    }
                    BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                    return socket.emit("courses::list", JSON.stringify(BondsJSON))
                }
            }
            CacheController.storeCache(uniqueID, { jsonCache: { BondsJSON, time: new Date().toISOString(), received } })
            console.log("Finish")
            return socket.emit("courses::list", JSON.stringify(BondsJSON));

        } catch (error) {
            console.error(error)
            return false;
        }
    }
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