import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { HomeworkDTO } from "../DTOs/Homework.DTO";
import { ActivityHomework, CourseStudent, SigaaFile, SigaaHomework } from "sigaa-api";
import { FileDTO } from "../DTOs/Attachments/File.DTO";
import { CourseDTO, ICourseDTOProps } from "../DTOs/CourseDTO";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import BondCache, { IBondCache } from "../services/cache/BondCache";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import HomeworksCache, { IHomeworkCache } from "../services/cache/HomeworksCache";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";

export class Homeworks {
	constructor(private socketService: Socket) { }
	/**
	 * Lista homeworks de todas as matérias de um vinculo especificado pelo registration
	 * @param params 
	 * @param query 
	 * @returns 
	 */
	async content(query: {
		inactive: boolean,
		cache: boolean,
		registration: string,
		courseId?: string,
		homeworkId?: string
		homeworkTitle?: string,
	}) {
		const apiEventError = events.api.error;
		try {

			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const bonds = BondCache.get<IBondCache[]>(uniqueID);
			if (bonds.length === 0) throw new Error("No bonds found in cache");
			const bond = bonds.find(bond => bond.registration === query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			if (query.cache) {
				const course = bond.courses.find(c => c.id === query.courseId); // garante que o usuário tem acesso a essa matéria
				if (course) {
					const homework = HomeworksCache.get<IHomeworkCache>(`Homework-${query.homeworkId}@${query.courseId}`);
					if (homework) {
						const courseDTO = new CourseDTO(course, course.postValues);
						const courseJSON = courseDTO.toJSON();
						return this.socketService.emit("homework::content", {
							...courseJSON,
							homeworks: [homework]
						} as ICourseDTOProps);
					}
				}
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const activities = await bondService.getActivities();
			const lastActivities = activities.filter(a => a.type === "homework") as ActivityHomework[];
			for (const activity of lastActivities) {

				if (query.homeworkTitle && query.homeworkTitle !== activity.homeworkTitle) continue;
				let coursesServices = bond.courses.map(c => CourseService.fromDTO(c, sigaaInstance));
				let courseService = coursesServices.find(({ course }) => course.title === activity.courseTitle);
				if (!courseService) {
					const courses = await bondService.getCourses();
					this.saveCourses(courses, bond, uniqueID);
					coursesServices = courses.map(c => new CourseService(c));
					const course = courses.find(c => c.title === activity.courseTitle);
					if (!course) throw new Error(`Course not found with title ${activity.courseTitle}`);
					courseService = new CourseService(course);
				}
				const homeworks = await courseService.getHomeworks() as SigaaHomework[];
				const homework = homeworks.find(h => h.id === activity.homeworkId);
				if (!homework) continue;
				console.log(`[homework - content] - ${homework.id}`);
				let attachmentFile: SigaaFile | null = null;
				try {
					attachmentFile = await homework.getAttachmentFile() as SigaaFile;
				} catch (error) {
					console.log("No attachment file found");
				}
				const fileDTO = attachmentFile ? new FileDTO(attachmentFile) : null;
				const content = await homework.getDescription();
				const haveGrade = await homework.getFlagHaveGrade();
				const isGroup = await homework.getFlagIsGroupHomework();
				console.log(`[homework - content] - ${homework.id} - content retrieved`);

				sigaaInstance.close();
				const courseDTO = this.storeCache(homework, fileDTO, content, haveGrade, isGroup, query, courseService);

				return this.socketService.emit("homework::content", courseDTO.toJSON());
			}


		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
	private saveCourses(courses: CourseStudent[], bondCached: IBondDTOProps, uniqueID: string) {
		const coursesDTOs = courses.map(course => {
			const courseService = new CourseService(course);
			return courseService.getDTO();
		});
		const bondDTO = BondDTO.fromJSON(bondCached);
		bondDTO.setAdditionals({ coursesDTOs });
		const bondJSON = bondDTO.toJSON();
		BondCache.merge(uniqueID, [bondJSON]);
	}
	private storeCache(homework: SigaaHomework, fileDTO: FileDTO, content: string, haveGrade: boolean, isGroup: boolean, query: { homeworkId?: string; courseId?: string; }, courseService: CourseService) {
		const homeworkDTO = new HomeworkDTO(homework, fileDTO, content, haveGrade, isGroup);
		HomeworksCache.set<IHomeworkCache>(`Homework-${query.homeworkId}@${query.courseId}`, homeworkDTO.toJSON());
		const courseDTO = courseService.getDTO();
		courseDTO.setAdditionals({ homeworksDTOs: [homeworkDTO] });
		return courseDTO;
	}
}