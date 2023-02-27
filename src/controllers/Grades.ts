
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import { Socket } from "socket.io";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { GradesService } from "../services/sigaa-api/Course/Grades.service";
import { Sigaa } from "sigaa-api";
import ResponseCache from "../services/cache/ResponseCache";
import BondCache from "../services/cache/BondCache";

export class Grades {
	constructor(private socketService: Socket) { }
	async list(query: { cache: boolean, registration: string, inactive: boolean, allPeriods: boolean }) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);
			
			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			
			const responseCache = ResponseCache.getResponse<IBondDTOProps>({ uniqueID, event: "grades::list", query});
			if (query.cache && responseCache) {
				console.log("[grades - list] - cache hit");
				return this.socketService.emit("grades::list", responseCache);
			}
			
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			
			const coursesServices = await this.getCoursesServices(bond, sigaaInstance);
			console.debug("[grades - list] - got courses services", coursesServices.length);
			const coursesDTOs: CourseDTO[] = [];

			for (const courseService of coursesServices) {
				console.log("[grades - list] - ", courseService.course.code);
				const gradeGroups = await courseService.getGrades();
				console.log("[grades - list] - ", courseService.course.code, gradeGroups.length);
				const gradesService = new GradesService(gradeGroups);
				const gradeGroupsDTOs = gradesService.getDTOs();
				const courseDTO = courseService.getDTO();
				courseDTO.setAdditionals({ gradeGroupsDTOs });
				coursesDTOs.push(courseDTO);
				const bondDTO = BondDTO.fromJSON(bond);
				bondDTO.setCourses(coursesDTOs);
				this.socketService.emit("grades::listPartial", bondDTO.toJSON());
				console.log("[grades - list] - finished", courseService.course.code);
			}
			sigaaInstance.close();
			const bondDTO = BondDTO.fromJSON(bond);
			bondDTO.setCourses(coursesDTOs);
			const bondJSON = bondDTO.toJSON();
			ResponseCache.setResponse({
				uniqueID,
				event: "grades::list",
				query
			}, bondJSON);
			return this.socketService.emit("grades::list", bondJSON);
		} catch (error) {
			console.error(error);
			this.socketService.emit("api::error", error.message);
			return false;
		}
	}
	// se é possivel rehydratar os coursesservices, rehidrate-os
	// se não, faça a requisição
	private async getCoursesServices(bond: IBondDTOProps, sigaaInstance: Sigaa) {
		if (bond.courses?.length > 0) {
			const coursesServices = bond.courses.map(course => CourseService.fromDTO(course, sigaaInstance));
			console.log(`[grades - list] - ${coursesServices.length} (rehydrated)`);
			return coursesServices;
		} else {
			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const courses = await bondService.getCourses();
			const coursesServices = courses.map(course => new CourseService(course));
			console.log(`[grades - list] - ${courses.length} (fetched)`);
			return coursesServices;
		}
	}
}