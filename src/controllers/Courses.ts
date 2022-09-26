import { CourseStudent, StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import { cacheUtil } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { events } from "../apiConfig.json";
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { BondDTO } from "../DTOs/Bond.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";

export class Courses {
  constructor(private socketService: Socket) { }
  /**
   * Lista matérias de um vinculo especificado pelo registration
   * @param params socket
   * @param query registration
   * @returns
   */
  async list(query: { inactive: boolean, allPeriods: boolean, cache: boolean, registration: string }) {
    const apiEventError = events.api.error;
    try {
      const { cache, uniqueID } = cacheUtil.restore(this.socketService.id);
      const { JSESSIONID, jsonCache } = cache;
      if(!JSESSIONID) {
        throw new Error("API: No JSESSIONID found in cache.");
      }
      if (query.cache) {
        const newest = cacheHelper.getNewest(jsonCache, query);
        if (newest) {
          const bond = newest["BondsJSON"].find(bond => bond.registration === query.registration);
          return this.socketService.emit("courses::list", bond);
        }
      }
      const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID, cache.sigaaURL)
      const accountService = new AccountService(account);
      const activeBonds = await accountService.getActiveBonds();
      const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
      const bonds = [...activeBonds, ...inactiveBonds];
      const bond = bonds.find(b => b.registration === query.registration) as StudentBond | undefined;
      if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
      const bondService = new BondService(bond);
      const period = await bondService.getCurrentPeriod()
      const active = activeBonds.includes(bond);
      const courses = await bondService.getCourses(query.allPeriods)
      console.log(`[courses - list] - ${courses.length}`)
      httpSession.close()
      const coursesDTOs: CourseDTO[] = []
      for (const course of courses) {
        const courseDTO = new CourseDTO(course);
        coursesDTOs.push(courseDTO)
      }
      const bondDTO = new BondDTO(bond, active, period, { coursesDTOs })
      const bondJSON = bondDTO.toJSON();
      cacheHelper.storeCache(uniqueID, {
        jsonCache: [
          { BondsJSON: [bondJSON], query, time: new Date().toISOString() },
        ],
        time: new Date().toISOString(),
      });
      return this.socketService.emit("courses::list", bondJSON);
    } catch (error) {
      console.error(error);
      this.socketService.emit(apiEventError, error.message);
      return false;
    }
  }

  /**
   * Parser da matéria
   * @param params
   * @returns
   */
  static parser(params: {
    course: CourseStudent;
    news?: any;
    grades?: any;
    homeworks?: any;
  }) {
    const { course, grades, homeworks, news } = params;
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
      news: news ?? [],
      grades: grades ?? [],
      homeworks: homeworks ?? [],
    };
  }
}
