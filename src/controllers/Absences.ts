

import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { Socket } from "socket.io";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import BondCache, { IBondCache } from "../services/cache/BondCache";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import { AbsencesDTO } from "../DTOs/Absences.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Sigaa } from "sigaa-api";

export class Absences {
	constructor(private socketService: Socket) { }
	async list(query: { cache: boolean, registration: string, inactive: boolean, allPeriods: boolean }) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const bonds = BondCache.get<IBondCache[]>(uniqueID);
			if (bonds.length === 0) throw new Error("No bonds found in cache");
			const bond = bonds.find(bond => bond.registration === query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			if (query.cache) {
				if (bond.courses.length > 0) {
					const absences = bond.courses.map(course => course.absences).filter(absences => !!absences);
					if (absences.length !== 0) {
						console.log(`[absences - list] - ${absences.length} (cached)`);
						return this.socketService.emit("absences::list", bond);
					}
				}
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
			const bondJSON = this.storeCache(bond, coursesDTOs, uniqueID);
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
	private storeCache(bond: IBondDTOProps, coursesDTOs: CourseDTO[], uniqueID: string) {
		const bondDTO = BondDTO.fromJSON(bond);
		bondDTO.setAdditionals({ coursesDTOs });
		const bondJSON = bondDTO.toJSON();
		BondCache.merge(uniqueID, [bondJSON]);
		return bondJSON;
	}
}