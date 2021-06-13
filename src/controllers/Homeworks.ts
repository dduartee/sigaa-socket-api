import { Homework, SigaaHomework, StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../api/BondSIGAA";
import { CourseSIGAA } from "../api/CourseSIGAA";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";

export class Homeworks {
    event: {
        list: {
            name: string
        },
        specific: {
            name: string
        },
        status: {
            name: string
        }
    }
    constructor() {
        this.event = {
            list: {
                name: "homeworks::list"
            },
            specific: {
                name: "homeworks::specific"
            },
            status: {
                name: "homeworks::status"
            }
        }
    }
    /**
     * Lista homeworks de uma máteria especificado pelo code
     * @param params socket
     * @param received code
     * @returns 
     */
    async specific(params: { socket: Socket }, received: jsonCache["received"]) {
        try {
            const { socket } = params;
            const { specific, status } = this.event;
            const eventName = specific.name;
            const eventStatus = status.name;

            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache

            if (received.cache) {
                const newest = cacheHelper.getNewest(jsonCache, received)
                if (newest) {
                    return socket.emit(eventName, JSON.stringify(newest["BondsJSON"]))
                }
            }
            const bonds = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];
            for (const bond of bonds) {
                const CoursesJSON = [];
                const courses = await new CourseSIGAA().getCourses(bond);
                for (const course of courses) {
                    if (course.code == received.code) {
                        const homeworksList: any = await new CourseSIGAA().getHomeworks(course)
                        const homeworks = await Homeworks.parser(homeworksList, received.fullHW);
                        CoursesJSON.push(Courses.parser({ course, homeworks }))
                        BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                        cacheHelper.storeCache(uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() })
                        return socket.emit(eventName, JSON.stringify(BondsJSON));
                    }
                }
            }
            return socket.emit(eventStatus, "Nothing found with code: " + received.code)

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
            const { list, status } = this.event;
            const eventName = list.name;
            const eventStatus = status.name;

            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
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
                    const CoursesJSON = [];
                    const courses = await new CourseSIGAA().getCourses(bond);
                    for (const course of courses) {
                        const homeworksList: any = await new CourseSIGAA().getHomeworks(course)
                        const homeworks = await Homeworks.parser(homeworksList, received.fullHW);
                        CoursesJSON.push(Courses.parser({ course, homeworks }))
                        socket.emit(eventName, JSON.stringify([Bonds.parser({ bond, CoursesJSON })]))
                    }
                    BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                }
            }
            cacheHelper.storeCache(uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() })
            return socket.emit(eventName, JSON.stringify(BondsJSON));

        } catch (error) {
            console.error(error);
            return false;
        }
    }
    static async parser(homeworkList: any[], full?: boolean) {
        const homeworks = [];
        for (const homework of homeworkList) {
            const description = full ? (await homework.getDescription()) : "";
            const haveGrade = full ? (await homework.getFlagHaveGrade()) : "";
            const isGroup = full ? (await homework.getFlagIsGroupHomework()) : "";
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