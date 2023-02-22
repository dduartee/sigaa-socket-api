import { Sigaa } from "sigaa-api";
import { Socket } from "socket.io";
import { IBondDTOProps } from "../DTOs/Bond.DTO";
import { CourseDTO, ICourseDTOProps } from "../DTOs/CourseDTO";
import { LessonDTO } from "../DTOs/Lessons.DTO";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import BondCache, { IBondCache } from "../services/cache/BondCache";
import { LessonService } from "../services/sigaa-api/Course/Lesson.service";
import LessonsCache, { ILessonsCache } from "../services/cache/LessonsCache";

export class Lessons {
	constructor(private socketService: Socket) { }
	async list(query: {
		inactive: boolean;
		cache: boolean,
		registration: string,
		courseId: string,
		allPeriods: boolean
	}) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const bonds = BondCache.get<IBondCache[]>(uniqueID);
			if (bonds.length === 0) throw new Error("No bonds found in cache");
			const bond = bonds.find(bond => bond.registration === query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			if (query.cache) {
				const course = bond.courses.find(course => course.id === query.courseId);
				if (!course) throw new Error(`Course not found with id ${query.courseId}`);
				const lessons = LessonsCache.get<ILessonsCache>(`Lessons-${course.id}`);
				if (lessons?.length > 0) {
					const courseDTO = new CourseDTO(course, course.postValues);
					const courseJSON = courseDTO.toJSON();
					return this.socketService.emit("lessons::list", {
						...courseJSON,
						lessons
					} as ICourseDTOProps);
				}
			}
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const courseService = await this.getCourseService(bond, query.courseId, sigaaInstance);
			const lessons = await courseService.getLessons();
			console.log(`[lessons - list] - ${lessons.length} lessons of ${courseService.course.id} retrieved`);
			const lessonsDTOs: LessonDTO[] = [];
			for (const lesson of lessons) {
				const lessonService = new LessonService(lesson);
				const lessonDTO = await lessonService.getDTO();
				lessonsDTOs.push(lessonDTO);
			}
			sigaaInstance.close();
			const lessonsJSON = lessonsDTOs.map(lesson => lesson.toJSON());
			LessonsCache.set<ILessonsCache>(`Lessons-${courseService.course.id}`, lessonsJSON);
			const courseDTO = courseService.getDTO();
			courseDTO.setAdditionals({ lessonsDTOs });
			const courseJSON = courseDTO.toJSON();
			return this.socketService.emit("lessons::list", courseJSON);
		} catch (error) {
			console.error(error);
			this.socketService.emit("api::error", error.message);
			return false;
		}
	}

	private async getCourseService(bond: IBondDTOProps, courseId: string, sigaaInstance: Sigaa) {
		const course = bond.courses.find(course => course.id === courseId);
		if (!course) throw new Error(`Course not found with id ${courseId}`);
		const courseService = CourseService.fromDTO(course, sigaaInstance);
		console.log(`[lessons - list] - courseService of ${course.id} retrieved`);
		return courseService;
	}
}
