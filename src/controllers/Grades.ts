
import { jsonCache, cacheUtil } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";
import { events } from "../apiConfig.json";
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { CourseService } from "../services/sigaa-api/Course.service";
import { Socket } from "socket.io";

export class Grades {
  constructor(private socketService: Socket) {}
  async list(query: { cache: boolean, registration: string, inactive: boolean, allPeriods: boolean }) {
    const eventName = events.grades.list;
    try {
      const { cache, uniqueID } = cacheUtil.restore(this.socketService.id);
      const { JSESSIONID, jsonCache } = cache;
      if (query.cache) {
        const newest = cacheHelper.getNewest(jsonCache, query);
        if (newest) {
          return this.socketService.emit(eventName, JSON.stringify(newest["BondsJSON"]));
        }
      }
      const { account, httpSession, pageCache, pageCacheWithBond } = await Authentication.loginWithJSESSIONID(JSESSIONID)
      const accountService = new AccountService(account);
      const activeBonds = await accountService.getActiveBonds();
      const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
      const bonds = [...activeBonds, ...inactiveBonds];
      const bond = bonds.find(bond => bond.registration === query.registration);
      const bondService = new BondService(bond);
      const period = await bondService.getCurrentPeriod()
      const courses = await bondService.getCourses(query.allPeriods);
      const CoursesJSON = [];
      for (const course of courses) {
        const courseService = new CourseService(course);
        pageCache.clearCachePage()
        pageCacheWithBond.clearCachePage()
        const grades = await courseService.getGrades();
        CoursesJSON.push(Courses.parser({ course, grades }));
        this.socketService.emit(
          "grades::listPartial", Bonds.parser({ bond, period, CoursesJSON })
        );
      }
      const bondJSON = Bonds.parser({ bond, period, CoursesJSON })
      cacheHelper.storeCache(uniqueID, {
        jsonCache: [{ BondsJSON: [bondJSON], query, time: new Date().toISOString() }],
        time: new Date().toISOString(),
      });
      httpSession.close();
      this.socketService.emit(eventName, bondJSON);
    } catch (error) {
      console.error(error);
      this.socketService.emit("api::error", error.message);
      return false;
    }
  }
}