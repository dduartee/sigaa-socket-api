import { Socket } from "socket.io";
import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import ResponseCache from "../services/cache/ResponseCache";
import BondCache from "../services/cache/BondCache";

interface ICourseQuery {
	inactive: boolean,
	allPeriods: boolean,
	cache: boolean,
	registration: string
}

export class Courses {
	constructor(private socketService: Socket) { }
	/**
   * Lista matérias de um vinculo especificado pelo registration
   * @param params socket
   * @param query registration
   * @returns	
   */
	async list(query: ICourseQuery) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			const responseCache = ResponseCache.getResponse<IBondDTOProps>({ uniqueID, event: "courses::list", query });
			if (query.cache && responseCache) {
				console.log("[courses - list] - cache hit");
				return this.socketService.emit("courses::list", responseCache);
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const bondService = BondService.fromDTO(bond, sigaaInstance);

			const courses = await bondService.getCourses(query.allPeriods);
			console.log(`[courses - list] - got ${courses.length} (rehydrated)`);

			sigaaInstance.close();

			const coursesDTOs = courses.map(course => {
				const courseService = new CourseService(course);
				return courseService.getDTO();
			});
			const bondDTO = BondDTO.fromJSON(bond);
			bondDTO.setCourses(coursesDTOs);
			const bondJSON = bondDTO.toJSON();

			ResponseCache.setResponse({
				uniqueID,
				event: "courses::list",
				query
			}, bondJSON, 3600 * 1.5);
			BondCache.setBond(uniqueID, bondJSON);
			return this.socketService.emit("courses::list", bondJSON);

		} catch (error) {
			console.error(error);
			return false;
		}
	}
}
