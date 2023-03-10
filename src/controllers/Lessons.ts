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
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Sigaa } from "sigaa-api";
import { IBondDTOProps } from "../DTOs/Bond.DTO";

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

			if (bond.courses) {
				if (query.cache) {
					const course = bond.courses.find(course => course.id === query.courseId);
				if (!course) throw new Error(`Course not found with id ${query.courseId}`);
					const sharedQuery = this.getSharedQuery(course);
					const responseCache = ResponseCache.getCourseSharedResponse({ event: "lessons::list", sharedQuery });
					if (responseCache) {
						console.log("[lessons - list] - cache hit");
						return this.socketService.emit("lessons::list", responseCache);
					}
				}
			} else {
				console.log("[lessons - list] - bond.courses is undefined (?????)")
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const courseService = await this.getCourseService(bond, query.courseId, sigaaInstance);
			if (!courseService) throw new Error(`Course not found with id ${query.courseId}`);

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
			const sharedQuery = this.getSharedQuery(courseJSON);

			const sharedResponse = ResponseCache.setCourseSharedResponse({ event: "lessons::list", sharedQuery }, courseJSON, 3600 * 48); // 2 dias
			return this.socketService.emit("lessons::list", sharedResponse);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
	/**
	 * Retorna um objeto com os dados que serão usados para identificar a resposta compartilhada
	 */
	private getSharedQuery(course: ICourseDTOProps) {
		return { courseId: course.id, period: course.period };
	}

	/**
		* Se por algum motivo não tenha o bond.courses, ele requisita ao SIGAA
		*/
	private async getCourseService(bond: IBondDTOProps, courseId: string, sigaaInstance: Sigaa): Promise<CourseService> {
		if (bond.courses?.length > 0) {
			const coursesServices = bond.courses.map(course => CourseService.fromDTO(course, sigaaInstance));
			console.log(`[getCourseService] - ${coursesServices.length} (rehydrated)`);
			return coursesServices.find(({ course }) => course.id === courseId);
		} else {
			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const courses = await bondService.getCourses();
			const coursesServices = courses.map(course => new CourseService(course));
			console.log(`[getCourseService] - ${courses.length} (fetched)`);
			return coursesServices.find(({ course }) => course.id === courseId);
		}
	}
}
