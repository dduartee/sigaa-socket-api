import { Socket } from "socket.io";
import { BondSIGAA } from "../services/sigaa-api/BondSIGAA";
import { jsonCache, cacheUtil } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";
import { events } from "../apiConfig.json";
import { CourseSIGAA } from "../services/sigaa-api/CourseSIGAA";
import Authentication from "../services/sigaa-api/Authentication";

export class Grades {
  async list(params: { socket: Socket }, received: jsonCache["received"]) {
    const { socket } = params;
    const eventName = events.grades.list;
    const apiEventError = events.api.error;
    try {
      const { cache, uniqueID } = cacheUtil.restore(socket.id);
      const { JSESSIONID, jsonCache } = cache;
      if (received.cache) {
        const newest = cacheHelper.getNewest(jsonCache, received);
        if (newest) {
          return socket.emit(eventName, JSON.stringify(newest["BondsJSON"]));
        }
      }
      const {account, httpSession, pageCache, pageCacheWithBond} = await Authentication.loginWithJSESSIONID(JSESSIONID)
      const bonds = await new BondSIGAA().getBonds(account, received.inactive);
      const BondsJSON = [];
      for (const bond of bonds) {
        if (bond.registration == received.registration) {
          const courses = await new CourseSIGAA().getCourses(bond, received.inactive);
          const CoursesJSON = [];
          for (const course of courses) {
            pageCache.clearCachePage()
            pageCacheWithBond.clearCachePage()
            const gradesGroups = await new CourseSIGAA().getGrades(course);
            const grades = gradesGroups;
            CoursesJSON.push(Courses.parser({ course, grades }));
            socket.emit(
              "grades::listPartial",
              JSON.stringify([Bonds.parser({ bond, CoursesJSON })])
            );
          }
          BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
        }
      }
      cacheHelper.storeCache(uniqueID, {
        jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }],
        time: new Date().toISOString(),
      });
      httpSession.close();
      socket.emit(eventName, JSON.stringify(BondsJSON));
    } catch (error) {
      console.error(error);
      socket.emit("api::error", error.message);
      return false;
    }
  }
  async specific(params: { socket: Socket }, received: jsonCache["received"]) {
    const { socket } = params;
    const eventName = events.grades.specific;
    const apiEventError = events.api.error;
    try {
      const { cache, uniqueID } = cacheUtil.restore(socket.id);
      const { JSESSIONID, jsonCache } = cache;
      if (received.cache) {
        const newest = cacheHelper.getNewest(jsonCache, received);
        if (newest) {
          return socket.emit(eventName, JSON.stringify(newest["BondsJSON"]));
        }
      }
      const {account, httpSession} = await Authentication.loginWithJSESSIONID(JSESSIONID)
      const bonds = await new BondSIGAA().getBonds(account, received.inactive);
      const BondsJSON = [];
      for (const bond of bonds) {
        const courses = await new CourseSIGAA().getCourses(bond);
        const CoursesJSON = [];
        for (const course of courses) {
          if (course.code == received.code) {
            const gradesGroups = await new CourseSIGAA().getGrades(course);
            const grades = gradesGroups;
            CoursesJSON.push(Courses.parser({ course, grades }));
            BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
            cacheHelper.storeCache(uniqueID, {
              jsonCache: [
                { BondsJSON, received, time: new Date().toISOString() },
              ],
              time: new Date().toISOString(),
            });
            return socket.emit(eventName, JSON.stringify(BondsJSON));
          }
        }
      }
    } catch (error) {
      console.error(error);
      socket.emit("api::error", error.message);
      return false;
    }
  }
}