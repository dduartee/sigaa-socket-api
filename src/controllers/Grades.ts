import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { Socket } from "socket.io";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { GradesService } from "../services/sigaa-api/Course/Grades.service";
import ResponseCache from "../services/cache/ResponseCache";
import LoggerService from "../services/LoggerService";
import BondCache from "../services/cache/BondCache";
import { CourseCommonController } from "./CourseCommonController";

type IGradeQuery = {
	cache: boolean,
	registration: string,
	inactive: boolean,
	allPeriods: boolean
}

export class Grades extends CourseCommonController {
	constructor(private socketService: Socket) {
		super();
	}
	async list(query: IGradeQuery) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id) as string;
			const { JSESSIONID, sigaaURL, username} = SessionMap.get<ISessionMap>(uniqueID) as ISessionMap;

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			const responseCache = ResponseCache.getResponse<IBondDTOProps>({ uniqueID, event: "grades::list", query });
			if (query.cache && responseCache) {
				return this.socketService.emit("grades::list", responseCache);
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const coursesServices = await this.getCoursesServices(bond, sigaaInstance);
			const coursesDTOs: CourseDTO[] = [];

			for (const courseService of coursesServices) {
				const gradeGroups = await courseService.getGrades();
				const gradesService = new GradesService(gradeGroups);
				const gradeGroupsDTOs = gradesService.getDTOs();
				const courseDTO = courseService.getDTO();
				courseDTO.setAdditionals({ gradeGroupsDTOs });
				coursesDTOs.push(courseDTO);
				const bondDTO = BondDTO.fromJSON(bond);
				bondDTO.setCourses(coursesDTOs);
				this.socketService.emit("grades::listPartial", bondDTO.toJSON());
				LoggerService.log(`[${username}: grades - list] - ${gradeGroups.length}`);
			}
			sigaaInstance.close();
			const bondDTO = BondDTO.fromJSON(bond);
			bondDTO.setCourses(coursesDTOs);
			const bondJSON = bondDTO.toJSON();
			ResponseCache.setResponse({
				uniqueID,
				event: "grades::list",
				query
			}, bondJSON, 3600 * 1.5);
			return this.socketService.emit("grades::list", bondJSON);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}