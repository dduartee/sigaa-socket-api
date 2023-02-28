import { Socket } from "socket.io";
import { ICourseDTOProps } from "../DTOs/CourseDTO";
import { LessonDTO } from "../DTOs/Lessons.DTO";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { LessonService } from "../services/sigaa-api/Course/Lesson.service";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";

interface ILessonsQuery {
	inactive: boolean;
	cache: boolean,
	registration: string,
	courseId: string,
	allPeriods: boolean
}
export class Lessons {
	constructor(private socketService: Socket) { }
	async list(query: ILessonsQuery) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			const course = bond.courses.find(course => course.id === query.courseId);
			if (!course) throw new Error(`Course not found with id ${query.courseId}`);

			const sharedQuery = { courseId: course.id, period: course.period };
			const responseCache = ResponseCache.getCourseSharedResponse({ event: "lessons::list", sharedQuery });
			if (query.cache && responseCache) {
				console.log("[lessons - list] - cache hit");
				return this.socketService.emit("lessons::list", responseCache);
			}
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const courseService = CourseService.fromDTO(course, sigaaInstance);
			const lessons = await courseService.getLessons();
			console.log(`[lessons - list] - ${lessons.length} lessons of ${courseService.course.id} retrieved`);
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
			const sharedResponse = ResponseCache.setCourseSharedResponse({ event: "lessons::list", sharedQuery }, courseJSON, 3600 * 48); // 2 dias
			return this.socketService.emit("lessons::list", sharedResponse);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}
