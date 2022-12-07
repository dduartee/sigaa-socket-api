import { CacheType } from "../services/cacheUtil";
import { events } from "../apiConfig.json";
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { Socket } from "socket.io";
import { CourseStudent } from "sigaa-api";
import { CourseDTO } from "../DTOs/CourseDTO";
import { cacheService } from "../services/cacheService";
import { CourseService } from "../services/sigaa-api/Course.service";
import { StudentDTO } from "../DTOs/Members/Student.DTO";
import { TeacherDTO } from "../DTOs/Members/Teacher.DTO";
import { MembersDTO } from "../DTOs/Members/Members.DTO";
import { cacheHelper } from "../helpers/Cache";
import { BondDTO } from "../DTOs/Bond.DTO";

export class Members {
	constructor(private socketService: Socket) { }
	/**
     * Lista Members de todas as matérias de um vinculo especificado pelo registration
     * @param params 
     * @param query 
     * @returns 
     */
	async list(query: {
        inactive: boolean,
        cache: boolean,
        registration: string,
        courseId?: string
    }) {
		const apiEventError = events.api.error;
		try {

			const uniqueID = cacheService.get<string>(this.socketService.id);
			const cache = cacheService.get<CacheType>(uniqueID);
			const { JSESSIONID, jsonCache } = cache;
			if (!JSESSIONID) {
				throw new Error("API: No JSESSIONID found in cache.");
			}
			if (query.cache) {
				const newest = cacheHelper.getNewest(cache.jsonCache, query);
				if (newest) {
					const bond = newest["BondsJSON"].find(bond => bond.registration === query.registration);
					const course = bond.courses.find(course => course.id === query.courseId);
					return this.socketService.emit("members::list", course);
				}
			}
			const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID, cache.sigaaURL);
			const accountService = new AccountService(account);
			const activeBonds = await accountService.getActiveBonds();
			const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
			const bonds = [...activeBonds, ...inactiveBonds];
			const bond = bonds.find(b => b.registration === query.registration);
			const bondService = new BondService(bond);
			const period = await bondService.getCurrentPeriod();
			const active = bonds.includes(bond);

			const courses = await bondService.getCourses() as CourseStudent[];
			const course = courses.find(c => c.title === query.courseId);
			const courseService = new CourseService(course);

			const members = await courseService.getMembers();
			const studentDTOs = members.students.map(student => new StudentDTO(student));
			const teachersDTOs = members.teachers.map(teacher => new TeacherDTO(teacher));
			const membersDTO = new MembersDTO(teachersDTOs, studentDTOs);
			const courseDTO = new CourseDTO(course, {membersDTO});
			const bondDTO = new BondDTO(bond, active, period, { coursesDTOs: [courseDTO] });
			const bondJSON = bondDTO.toJSON();
			cacheHelper.storeCache(uniqueID, {
				jsonCache: [
					{ BondsJSON: [bondJSON], query, time: new Date().toISOString() },
				],
				time: new Date().toISOString(),
			});
			httpSession.close();
			return this.socketService.emit("members::list", courseDTO.toJSON());
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}