
import { CacheType } from "../services/cacheUtil";
import { cacheHelper } from "../helpers/Cache";
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
import { ArithmeticAverageDTO } from "../DTOs/GradeGroup/ArithmeticAverage.DTO";
import { cacheService } from "../services/cacheService";

export class Grades {
	constructor(private socketService: Socket) { }
	async list(query: { cache: boolean, registration: string, inactive: boolean, allPeriods: boolean }) {
		try {
			const uniqueID = cacheService.get<string>(this.socketService.id);
			const cache = cacheService.get<CacheType>(uniqueID);
			const { JSESSIONID, jsonCache } = cache;
			if(!JSESSIONID) {
				throw new Error("API: No JSESSIONID found in cache.");
			}
			if (query.cache) {
				const newest = cacheHelper.getNewest(jsonCache, query);
				if (newest) {
					const bond = newest["BondsJSON"].find(bond => bond.registration === query.registration);
					return this.socketService.emit("grades::list", bond);
				}
			}
			const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID, new URL(cache.sigaaURL));
			const accountService = new AccountService(account);
			const activeBonds = await accountService.getActiveBonds();
			const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
			const bonds = [...activeBonds, ...inactiveBonds];
			const bond = bonds.find(bond => bond.registration === query.registration);
			const bondService = new BondService(bond);
			const period = await bondService.getCurrentPeriod();
			const active = bonds.includes(bond);
			const courses = await bondService.getCourses(query.allPeriods);
			const coursesDTOs: CourseDTO[] = [];
			for (const course of courses) {
				const courseService = new CourseService(course);
				const gradeGroups = await courseService.getGrades();
				console.log(`[grades - list] - ${gradeGroups.length}`);
				const gradeGroupsDTOs = gradeGroups.map(gradeGroup => {
					let subGradesDTOs: SubGradeDTO[] = [];
					switch (gradeGroup.type) {
					case "only-average":
						subGradesDTOs = [];
						break;
					case "sum-of-grades":
						subGradesDTOs = gradeGroup.grades.map(sumOfGrades => new SumOfGradesDTO(sumOfGrades));
						break;
					case "weighted-average":
						subGradesDTOs = gradeGroup.grades.map(weightedAverage => new WeightedAverageDTO(weightedAverage));
						break;
					case "arithmetic-average":
						subGradesDTOs = gradeGroup.grades.map(arithmeticAverage => new ArithmeticAverageDTO(arithmeticAverage));
						break;
					default:
						subGradesDTOs = [];
						break;
					}
					const gradeGroupDTO = new GradeGroupDTO(gradeGroup, subGradesDTOs);
					return gradeGroupDTO;
				});
				const courseDTO = new CourseDTO(course, { gradeGroupsDTOs });
				coursesDTOs.push(courseDTO);
				const bondDTO = new BondDTO(bond, active, period, { coursesDTOs });
				this.socketService.emit(
					"grades::listPartial", bondDTO.toJSON()
				);
			}
			const bondDTO = new BondDTO(bond, active, period, { coursesDTOs });
			cacheHelper.storeCache(uniqueID, {
				jsonCache: [{ BondsJSON: [bondDTO.toJSON()], query, time: new Date().toISOString() }],
				time: new Date().toISOString(),
			});
			httpSession.close();
			this.socketService.emit("grades::list", bondDTO.toJSON());
		} catch (error) {
			console.error(error);
			this.socketService.emit("api::error", error.message);
			return false;
		}
	}
}