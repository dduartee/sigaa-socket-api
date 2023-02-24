

import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { Socket } from "socket.io";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import { AbsencesDTO } from "../DTOs/Absences.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Sigaa } from "sigaa-api";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";

export class Absences {
	constructor(private socketService: Socket) { }
	async list(query: { cache: boolean, registration: string, inactive: boolean, allPeriods: boolean }) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			
			const responseCache = ResponseCache.getResponse({ uniqueID, event: "absences::list", query });
			if (query.cache && responseCache) {
				console.log("[absences - list] - cache hit");
				return this.socketService.emit("absences::list", responseCache);
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const coursesServices = await this.getCoursesServices(bond, sigaaInstance);

			const coursesDTOs: CourseDTO[] = [];
			for (const courseService of coursesServices) {
				console.log(`[absences - list] - getting absences from ${courseService.course.code}`);
				const absences = await courseService.getAbsences();
				console.log(`[absences - list] - got ${absences.list.length} absences from ${courseService.course.code}`);
				const absencesDTO = new AbsencesDTO(absences);
				const courseDTO = courseService.getDTO();
				courseDTO.setAdditionals({ absencesDTO });
				coursesDTOs.push(courseDTO);
				const bondDTO = new BondDTO(bond, bond.active, bond.period, bond.sequence);
				bondDTO.setAdditionals({ coursesDTOs });
				this.socketService.emit("absences::listPartial", bondDTO.toJSON());
			}
			sigaaInstance.close();
			const bondDTO = BondDTO.fromJSON(bond);
			bondDTO.setAdditionals({ coursesDTOs });
			const bondJSON = bondDTO.toJSON();
			ResponseCache.setResponse({ uniqueID, event: "absences::list", query }, bondJSON);
			return this.socketService.emit("absences::list", bondJSON);
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
			return coursesServices;
		}
	}
}