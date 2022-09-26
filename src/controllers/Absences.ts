
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
import { GradeGroupDTO } from "../DTOs/GradeGroup/GradeGroup.DTO";
import { WeightedAverageDTO } from "../DTOs/GradeGroup/WeightedAverage.DTO";
import { SumOfGradesDTO } from "../DTOs/GradeGroup/SumOfGrades.DTO";
import { SubGradeDTO } from "../DTOs/GradeGroup/SubGrade.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO } from "../DTOs/Bond.DTO";
import { AbsencesDTO } from "../DTOs/Absences.DTO";

export class Absences {
  constructor(private socketService: Socket) { }
  async list(query: { cache: boolean, registration: string, inactive: boolean, allPeriods: boolean }) {
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
          return this.socketService.emit("absences::list", bond);
        }
      }
      const { account, httpSession } = await Authentication.loginWithJSESSIONID(JSESSIONID)
      const accountService = new AccountService(account);
      const activeBonds = await accountService.getActiveBonds();
      const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
      const bonds = [...activeBonds, ...inactiveBonds];
      const bond = bonds.find(bond => bond.registration === query.registration);
      const bondService = new BondService(bond);
      const period = await bondService.getCurrentPeriod()
      const active = bonds.includes(bond);
      const courses = await bondService.getCourses(query.allPeriods);
      const coursesDTOs: CourseDTO[] = []
      for (const course of courses) {
        const courseService = new CourseService(course);
        const absences = await courseService.getAbsences();
        console.log(`[absences - list] - ${absences.list.length}`)
        const absencesDTO = new AbsencesDTO(absences);
        const courseDTO = new CourseDTO(course, { absencesDTO })
        coursesDTOs.push(courseDTO)
        const bondDTO = new BondDTO(bond, active, period, { coursesDTOs })
        this.socketService.emit(
          "absences::listPartial", bondDTO.toJSON()
        );
      }
      const bondDTO = new BondDTO(bond, active, period, { coursesDTOs })
      cacheHelper.storeCache(uniqueID, {
        jsonCache: [{ BondsJSON: [bondDTO.toJSON()], query, time: new Date().toISOString() }],
        time: new Date().toISOString(),
      });
      httpSession.close();
      this.socketService.emit("absences::list", bondDTO.toJSON());
    } catch (error) {
      console.error(error);
      this.socketService.emit("api::error", error.message);
      return false;
    }
  }
}