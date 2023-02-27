import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { HomeworkDTO } from "../DTOs/Homework.DTO";
import { ActivityHomework, SigaaFile, SigaaHomework } from "sigaa-api";
import { FileDTO } from "../DTOs/Attachments/File.DTO";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";

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
		courseTitle?: string,
		homeworkId?: string
		homeworkTitle?: string,
	}) {
		const apiEventError = events.api.error;
		try {

			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			const activitiesLoaded = bond.activities !== undefined;
			if(!activitiesLoaded) throw new Error(`Bond ${query.registration} has no activities loaded`);
			
			const coursesLoaded = bond.courses.length !== undefined;
			if (query.cache && coursesLoaded) {
				const course = bond.courses.find(course => course.id === query.courseTitle);
				const sharedQuery = {courseId: course.id, homeworkId: query.homeworkId, homeworkTitle: query.homeworkTitle};
				const responseCache = ResponseCache.getSharedResponse({ event: "homework::content", sharedQuery });
				if (responseCache) {
					console.log("[homework - content] - cache hit");
					return this.socketService.emit("homework::content", responseCache);
				}
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const activities = bond.activities
			const lastActivities = activities.filter(a => a.type === "homework")
			for (const activity of lastActivities) {
				if (query.homeworkTitle && query.homeworkTitle !== activity.title) continue;
				let coursesServices = bond.courses.map(c => CourseService.fromDTO(c, sigaaInstance));
				let courseService = coursesServices.find(({ course }) => course.title === activity.course.title);
				if (!courseService) { // caso não esteja no cache
					const courses = await bondService.getCourses();
					coursesServices = courses.map(c => new CourseService(c));
					const course = courses.find(c => c.title === activity.course.title);
					if (!course) throw new Error(`Course not found with title ${activity.course.title}`);
					courseService = new CourseService(course); // cria o courseService vindo do SIGAA
				}
				const homeworks = await courseService.getHomeworks() as SigaaHomework[];
				const homework = homeworks.find(h => h.id === activity.id);
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
				const homeworkDTO = new HomeworkDTO(homework, fileDTO, content, haveGrade, isGroup);
				const courseDTO = courseService.getDTO();
				courseDTO.setAdditionals({ homeworksDTOs: [homeworkDTO] });
				const courseJSON = courseDTO.toJSON();
				const sharedQuery = {courseId: courseJSON.id, homeworkId: homework.id, homeworkTitle: homework.title};
				ResponseCache.setSharedResponse({ event: "homework::content", sharedQuery }, courseJSON);
				return this.socketService.emit("homework::content", courseJSON);
			}
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}