import { CourseStudentData, StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { BondDTO } from "../DTOs/Bond.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import SessionMap from "../services/SessionMap";
import SocketReferenceMap from "../services/SocketReferenceMap";
import StudentMap from "../services/StudentMap";

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
			const uniqueID = SocketReferenceMap.get(this.socketService.id);
			const cache = SessionMap.get(uniqueID);
			const { JSESSIONID } = cache;
			if (query.cache && StudentMap.has(uniqueID)) {
				const student = StudentMap.get(uniqueID);
				const bond = student.bonds.find(b => b.registration === query.registration);
				if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
				if(bond.courses.length > 0) {
					return this.socketService.emit("courses::list", bond);
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
			const bond = bonds.find(b => b.registration === query.registration) as StudentBond | undefined;
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			const bondService = new BondService(bond);
			const period = await bondService.getCurrentPeriod();
			const active = activeBonds.includes(bond);
			const courses = await bondService.getCourses(query.allPeriods);
			console.log(`[courses - list] - ${courses.length}`);
			sigaaInstance.close();
			const coursesDTOs: CourseDTO[] = [];
			for (const course of courses) {
				const form = course.getCourseForm();
				const courseData: CourseStudentData = { form, ...course };
				const courseDTO = new CourseDTO(courseData);
				coursesDTOs.push(courseDTO);
			}
			const bondDTO = new BondDTO(bond, active, period);
			bondDTO.setAdditionals({ coursesDTOs });
			const bondJSON = bondDTO.toJSON();
			StudentMap.merge(uniqueID, { bonds: [bondJSON] });
			return this.socketService.emit("courses::list", bondJSON);
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}
