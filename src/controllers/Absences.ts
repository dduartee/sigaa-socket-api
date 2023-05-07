import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { Socket } from "socket.io";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import { AbsencesDTO } from "../DTOs/Absences.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";
import LoggerService from "../services/LoggerService";
import { CourseCommonController } from "./CourseCommonController";

type IAbsencesQuery = {
	cache: boolean;
	registration: string;
	inactive: boolean;
	allPeriods: boolean;
}

export class Absences extends CourseCommonController {
	constructor(private socketService: Socket) {
		super();
	}
	async list(query: IAbsencesQuery) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id) as string;
			const { JSESSIONID, sigaaURL, username } = SessionMap.get<ISessionMap>(uniqueID) as ISessionMap;

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			
			const responseCache = ResponseCache.getResponse<IBondDTOProps>({ uniqueID, event: "absences::list", query });
			if (query.cache && responseCache) {
				return this.socketService.emit("absences::list", responseCache);
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const coursesServices = await this.getCoursesServices(bond, sigaaInstance);

			const coursesDTOs: CourseDTO[] = [];
			for (const courseService of coursesServices) {
				const absences = await courseService.getAbsences();
				if(!absences) throw new Error(`Absences not found for course ${courseService.course.id}`);
				LoggerService.log(`[${username}: absences - list] - got ${absences.list.length}`);
				const absencesDTO = new AbsencesDTO(absences);
				const courseDTO = courseService.getDTO();
				courseDTO.setAdditionals({ absencesDTO });
				coursesDTOs.push(courseDTO);
				const bondDTO = new BondDTO(bond, bond.active, bond.period, bond.sequence);
				bondDTO.setCourses(coursesDTOs);
				this.socketService.emit("absences::listPartial", bondDTO.toJSON());
			}
			sigaaInstance.close();
			const bondDTO = BondDTO.fromJSON(bond);
			bondDTO.setCourses(coursesDTOs);
			const bondJSON = bondDTO.toJSON();
			ResponseCache.setResponse({ uniqueID, event: "absences::list", query }, bondJSON, 3600 * 1.5);
			return this.socketService.emit("absences::list", bondJSON);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}