import { Homework, SigaaHomework, StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../api/BondSIGAA";
import { CourseSIGAA } from "../api/CourseSIGAA";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { CacheController } from "./Cache";
import { Courses } from "./Courses";

export class Homeworks {
    /**
     * Lista homeworks de uma máteria especificado pelo code
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
                return socket.emit("homeworks::specific", JSON.stringify(newest["BondsJSON"]))
            }
            const bonds = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];
            for (const bond of bonds) {
                const CoursesJSON = [];
                const courses = await new CourseSIGAA().getCourses(bond);
                for (const course of courses) {
                    if (course.code == received.code) {
                        const homeworksList: any = await new CourseSIGAA().getHomeworks(course)
                        const homeworks = await this.parser(homeworksList, received.fullHW);
                        CoursesJSON.push(Courses.parser({ course, homeworks }))
                        BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                        CacheController.storeCache(uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() })
                        return socket.emit("homeworks::specific", JSON.stringify(BondsJSON));
                    }
                }
            }
            return socket.emit("homeworks::status", "Nothing found with code: " + received)

        } catch (error) {
            console.error(error);
            return false;
        }
    }
    /**
     * Lista homeworks de todas as matérias de um vinculo especificado pelo registration
     * @param params 
     * @param received 
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
                return socket.emit("homeworks::specific", JSON.stringify(newest["BondsJSON"]))
            }
            const bonds = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];
            for (const bond of bonds) {
                if (bond.registration == received.registration) {
                    const CoursesJSON = [];
                    const courses = await new CourseSIGAA().getCourses(bond);
                    for (const course of courses) {
                        const homeworksList: any = await new CourseSIGAA().getHomeworks(course)
                        const homeworks = await this.parser(homeworksList, received.fullHW);
                        CoursesJSON.push(Courses.parser({ course, homeworks }))
                        socket.emit("homeworks::list", JSON.stringify([Bonds.parser({ bond, CoursesJSON })]))
                    }
                    BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                }
            }
            CacheController.storeCache(uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() })
            return socket.emit("homeworks::list", JSON.stringify(BondsJSON));

        } catch (error) {
            console.error(error);
            return false;
        }
    }
    async parser(homeworkList: SigaaHomework[], full?: boolean) {
        const homeworks = [];
        for (const homework of homeworkList) {
            const description = full ? (await homework.getDescription()) : "";
            const haveGrade = full ? (await homework.getHaveGrade() ? "Vale nota" : "Não vale nota") : "";
            const startDate = homework.startDate;
            const endDate = homework.endDate;
            const title = homework.title;
            homeworks.push({
                title,
                description,
                startDate,
                endDate,
                haveGrade,
            });
        }
        return homeworks;
    }
}