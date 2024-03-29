import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { Socket } from "socket.io";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";
import LoggerService from "../services/LoggerService";
import { SyllabusDTO } from "../DTOs/Syllabus.DTO";
import { CourseCommonController } from "./CourseCommonController";

interface ISyllabusQuery {
    inactive: boolean;
    cache: boolean,
    registration: string,
    courseId: string,
}
export class Syllabus extends CourseCommonController {
	constructor(private socketService: Socket) {
		super();
	}
	async content(query: ISyllabusQuery) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id) as string;
			const { JSESSIONID, sigaaURL, username } = SessionMap.get<ISessionMap>(uniqueID) as ISessionMap;

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
            
			if (bond.courses) {
				if (query.cache) {
					const course = bond.courses.find(course => course.id === query.courseId);
					if (!course) throw new Error(`Course not found with id ${query.courseId}`);
					const sharedQuery = this.getSharedQuery(course);
					const responseCache = ResponseCache.getCourseSharedResponse({ event: "syllabus::content", sharedQuery });
					if (responseCache) {
						return this.socketService.emit("syllabus::content", responseCache);
					}
				}
			} else {
				LoggerService.log("[syllabus - content] - bond.courses is undefined (?????)");
			}
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const courseService = await this.getCourseService(bond, query.courseId, sigaaInstance);
			if (!courseService) throw new Error(`Course not found with id ${query.courseId}`);

			const syllabus = await courseService.getSyllabus();
			if (!syllabus) throw new Error(`Syllabus not found with course id ${query.courseId}`);
			LoggerService.log(`[${username}: syllabus - content] - syllabus fetched`);
			const syllabusDTO = new SyllabusDTO(syllabus);
			sigaaInstance.close();
			const courseDTO = courseService.getDTO();
			courseDTO.setAdditionals({ syllabusDTO });
			const courseJSON = courseDTO.toJSON();

			const sharedQuery = this.getSharedQuery(courseJSON);
			const sharedResponse = ResponseCache.setCourseSharedResponse({ event: "syllabus::content", sharedQuery }, courseJSON, 3600 * 336); // 14 dias
			return this.socketService.emit("syllabus::content", sharedResponse);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}