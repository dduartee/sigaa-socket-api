import { Socket } from "socket.io";
import { LessonDTO } from "../DTOs/Lessons.DTO";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { LessonService } from "../services/sigaa-api/Course/Lesson.service";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";
import LoggerService from "../services/LoggerService";
import { CourseCommonController } from "./CourseCommonController";

interface ILessonsQuery {
	inactive: boolean;
	cache: boolean,
	registration: string,
	courseId: string,
	allPeriods: boolean
}
export class Lessons extends CourseCommonController {
	constructor(private socketService: Socket) {
		super();
	}
	async list(query: ILessonsQuery) {
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
					const responseCache = ResponseCache.getCourseSharedResponse({ event: "lessons::list", sharedQuery });
					if (responseCache) {
						return this.socketService.emit("lessons::list", responseCache);
					}
				}
			} else {
				LoggerService.log("[lessons - list] - bond.courses is undefined (?????)");
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const courseService = await this.getCourseService(bond, query.courseId, sigaaInstance);
			if (!courseService) throw new Error(`Course not found with id ${query.courseId}`);

			const lessons = await courseService.getLessons();
			LoggerService.log(`[${username}: lessons - list] - ${lessons.length} lessons retrieved`);
			const lessonsDTOs: LessonDTO[] = [];
			for (const lesson of lessons) {
				const lessonService = new LessonService(lesson);
				const lessonDTO = await lessonService.getDTO();
				lessonsDTOs.push(lessonDTO);
			}
			sigaaInstance.close();
			const courseDTO = courseService.getDTO();
			courseDTO.setAdditionals({ lessonsDTOs });
			const courseJSON = courseDTO.toJSON();
			const sharedQuery = this.getSharedQuery(courseJSON);

			const sharedResponse = ResponseCache.setCourseSharedResponse({ event: "lessons::list", sharedQuery }, courseJSON, 3600 * 48); // 2 dias
			return this.socketService.emit("lessons::list", sharedResponse);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}
