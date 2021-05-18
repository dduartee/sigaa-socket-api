import { GradeGroup } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../api/BondSIGAA";
import { CourseSIGAA } from "../api/CourseSIGAA";
import { jsonCache, cacheUtil } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { CacheController } from "./Cache";
import { Courses } from "./Courses";

export class Grades {
    event: {
        list: {
            name: string
        },
        specific: {
            name: string
        }
    }
    constructor() {
        this.event = {
            list: {
                name: "grades::list"
            },
            specific: {
                name: "grades::specific"
            }
        }
    }
    async specific(params: { socket: Socket }, received: jsonCache["received"]) {
        try {
            const { socket } = params;
            const { specific } = this.event;
            const eventName = specific.name;

            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            const newest = CacheController.getNewest(jsonCache, received)
            if (newest) return socket.emit(eventName, JSON.stringify(newest["BondsJSON"]))

            const bonds = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];
            for (const bond of bonds) {
                debugger
                const courses = await new CourseSIGAA().getCourses(bond);
                const CoursesJSON = [];
                for (const course of courses) {
                        if (course.code == received.code) {
                        const gradesGroups = await new CourseSIGAA().getGrades(course);
                        const grades = Grades.parser(gradesGroups)
                        CoursesJSON.push(Courses.parser({ course, grades }))
                        BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                        CacheController.storeCache(uniqueID, { account, jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() })
                        return socket.emit(eventName, JSON.stringify(BondsJSON));
                    }
                }
            }
        } catch (error) {
            console.error(error)
            return false;
        }
    }
    static parser(gradesGroups: GradeGroup[]) {
        const gradeJSON = [];
        const personalGrade = [];

        for (const gradesGroup of gradesGroups) {
            switch (gradesGroup.type) {
                case "only-average":
                    gradeJSON.push({
                        name: gradesGroup.name,
                        value: gradesGroup.value,
                    });
                    break;
                case "weighted-average":
                    for (const grade of gradesGroup.grades) {
                        personalGrade.push({
                            name: grade.name,
                            weight: grade.weight,
                            value: grade.value,
                        });
                    }
                    gradeJSON.push({
                        personalGrade,
                        groupGrade: gradesGroup.value,
                    });
                    break;
                case "sum-of-grades":
                    for (const grade of gradesGroup.grades) {
                        personalGrade.push({
                            name: grade.name,
                            maxValue: grade.maxValue,
                            value: grade.value,
                        });
                    }
                    gradeJSON.push({
                        personalGrade,
                        groupGrade: gradesGroup.value,
                    });
                    break;
            }
        }
        return gradeJSON;
    }
}