import { Socket } from "socket.io";
import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { CourseStudent } from "sigaa-api";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import BondCache, { IBondCache } from "../services/cache/BondCache";

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
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const bonds = BondCache.get<IBondCache[]>(uniqueID);
			if(bonds.length === 0) throw new Error("No bonds found in cache");

			const bond = bonds.find(bond => bond.registration === query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			if (query.cache) {
				if(bond.courses.length > 0) {
					console.log(`[courses - list] - got ${bond.courses.length} (cached)`);
					return this.socketService.emit("courses::list", bond);
				}
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			
			const bondService = BondService.fromDTO(bond, sigaaInstance);

			const courses = await bondService.getCourses(query.allPeriods);
			console.log(`[courses - list] - got ${courses.length} (rehydrated)`);

			sigaaInstance.close();

			const bondJSON = this.storeCache(courses, bond, uniqueID);
			return this.socketService.emit("courses::list", bondJSON);
			
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}

	private storeCache(courses: CourseStudent[], bondCached: IBondDTOProps, uniqueID: string) {
		const coursesDTOs = courses.map(course => {
			const courseService = new CourseService(course);
			return courseService.getDTO();
		});
		const bondDTO = BondDTO.fromJSON(bondCached);
		bondDTO.setAdditionals({ coursesDTOs });
		const bondJSON = bondDTO.toJSON();
		BondCache.merge(uniqueID, [bondJSON]);
		return bondJSON;
	}
}
