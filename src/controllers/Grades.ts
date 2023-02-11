
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import { Socket } from "socket.io";
import { GradeGroupDTO } from "../DTOs/GradeGroup/GradeGroup.DTO";
import { WeightedAverageDTO } from "../DTOs/GradeGroup/WeightedAverage.DTO";
import { SumOfGradesDTO } from "../DTOs/GradeGroup/SumOfGrades.DTO";
import { SubGradeDTO } from "../DTOs/GradeGroup/SubGrade.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO } from "../DTOs/Bond.DTO";
import { ArithmeticAverageDTO } from "../DTOs/GradeGroup/ArithmeticAverage.DTO";
import SessionMap from "../services/SessionMap";
import SocketReferenceMap from "../services/SocketReferenceMap";
import StudentMap from "../services/StudentMap";

export class Grades {
	constructor(private socketService: Socket) { }
	async list(query: { cache: boolean, registration: string, inactive: boolean, allPeriods: boolean }) {
		try {
			const uniqueID = SocketReferenceMap.get(this.socketService.id);
			const cache = SessionMap.get(uniqueID);
			const { JSESSIONID} = cache;
			// if (query.cache && StudentMap.has(uniqueID)) {
			// 	const student = StudentMap.get(uniqueID);
			// 	const bond = student.bonds.find(bond => bond.registration === query.registration);
			// 	if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			// 	if (bond.courses.length > 0) {
			// 		const grades = bond.courses.map(course => course.grades).flat();
			// 		if (grades.length > 0) {
			// 			return this.socketService.emit("grades::list", bond);
			// 		}
			// 	}
			// }
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
				const bondDTO = new BondDTO(bond, active, period);
				bondDTO.setAdditionals({ coursesDTOs });
				this.socketService.emit(
					"grades::listPartial", bondDTO.toJSON()
				);
			}
			sigaaInstance.close();
			const bondDTO = new BondDTO(bond, active, period);
			bondDTO.setAdditionals({ coursesDTOs });
			StudentMap.merge(uniqueID, {
				bonds: [bondDTO.toJSON()]
			});
			this.socketService.emit("grades::list", bondDTO.toJSON());
		} catch (error) {
			console.error(error);
			this.socketService.emit("api::error", error.message);
			return false;
		}
	}
}