

import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import { Socket } from "socket.io";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO } from "../DTOs/Bond.DTO";
import { AbsencesDTO } from "../DTOs/Absences.DTO";
import SocketReferenceMap from "../services/SocketReferenceMap";
import SessionMap from "../services/SessionMap";
import StudentMap from "../services/StudentMap";

export class Absences {
	constructor(private socketService: Socket) { }
	async list(query: { cache: boolean, registration: string, inactive: boolean, allPeriods: boolean }) {
		try {
			const uniqueID = SocketReferenceMap.get(this.socketService.id);
			const cache = SessionMap.get(uniqueID);
			const { JSESSIONID } = cache;
			if (query.cache && StudentMap.has(uniqueID)) {
				const student = StudentMap.get(uniqueID);
				const bond = student.bonds.find(bond => bond.registration === query.registration);
				if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
				if (bond.courses.length > 0) {
					const absences = bond.courses.map(course => course.absences);
					if (absences.length > 0) {
						return this.socketService.emit("absences::list", bond);
					}
				}
			}

			const sigaaURL = new URL(cache.sigaaURL);
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);

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
				const absences = await courseService.getAbsences();
				console.log(`[absences - list] - ${absences.list.length}`);
				const absencesDTO = new AbsencesDTO(absences);
				const courseDTO = new CourseDTO(course, { absencesDTO });
				coursesDTOs.push(courseDTO);
				const bondDTO = new BondDTO(bond, active, period);
				bondDTO.setAdditionals( { coursesDTOs });
				this.socketService.emit(
					"absences::listPartial", bondDTO.toJSON()
				);
			}
			const bondDTO = new BondDTO(bond, active, period);
			bondDTO.setAdditionals( { coursesDTOs });
			StudentMap.merge(uniqueID,{
				bonds: [bondDTO.toJSON()]
			});
			sigaaInstance.close();
			this.socketService.emit("absences::list", bondDTO.toJSON());
		} catch (error) {
			console.error(error);
			this.socketService.emit("api::error", error.message);
			return false;
		}
	}
}