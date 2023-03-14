import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { Sigaa } from "sigaa-api";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";
import { IBondDTOProps } from "../DTOs/Bond.DTO";
import { SyllabusDTO } from "../DTOs/Syllabus.DTO";
import { ICourseDTOProps } from "../DTOs/CourseDTO";

interface ISyllabusQuery {
    inactive: boolean;
    cache: boolean,
    registration: string,
    courseId: string,
}
export class Syllabus {
	constructor(private socketService: Socket) { }
	async content(query: ISyllabusQuery) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL, username } = SessionMap.get<ISessionMap>(uniqueID);

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
				console.log("[syllabus - content] - bond.courses is undefined (?????)");
			}
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const courseService = await this.getCourseService(bond, query.courseId, sigaaInstance);
			if (!courseService) throw new Error(`Course not found with id ${query.courseId}`);

			const syllabus = await courseService.getSyllabus();
			console.log(`[${username}: syllabus - content] - syllabus fetched`);
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