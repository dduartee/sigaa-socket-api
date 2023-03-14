import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { HomeworkDTO } from "../DTOs/Homework.DTO";
import { Sigaa, SigaaFile, SigaaHomework } from "sigaa-api";
import { FileDTO } from "../DTOs/Attachments/File.DTO";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";
import { IBondDTOProps } from "../DTOs/Bond.DTO";

interface IHomeworkQuery {
	inactive: boolean,
	cache: boolean,
	registration: string,
	courseTitle?: string,
	homeworkId?: string
	homeworkTitle?: string,
}
export class Homeworks {
	constructor(private socketService: Socket) { }
	/**
	 * Lista homeworks de todas as matérias de um vinculo especificado pelo registration
	 * @param params 
	 * @param query 
	 * @returns 
	 */
	async content(query: IHomeworkQuery) {
		try {

			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL, username } = SessionMap.get<ISessionMap>(uniqueID);

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			/**
			 * para ver o conteudo da matéria, é necessário que ele tenha atividades carregadas
			 */
			const activitiesLoaded = bond.activities !== undefined;
			if (!activitiesLoaded) throw new Error(`Bond ${query.registration} has no activities loaded`);

			if (bond.courses) {
				if (query.cache) {
					const course = bond.courses.find(course => course.title === query.courseTitle);
					if (!course) throw new Error(`Course not found with title ${query.courseTitle}`);
					const homeworkQuery = { id: query.homeworkId, title: query.homeworkTitle };
					const sharedQuery = this.getSharedQuery(course, homeworkQuery);
					const responseCache = ResponseCache.getCourseSharedResponse({ event: "homework::content", sharedQuery });
					if (responseCache) {
						return this.socketService.emit("homework::content", responseCache);
					}
				}
			} else {
				console.log("[homework - content] - bond.courses is undefined (?????)");
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const homeworkActivity = bond.activities.find(a => a.type === "homework" && a.title === query.homeworkTitle && a.id === query.homeworkId);

			const courseService = await this.getCourseService(bond, query.courseTitle, sigaaInstance);
			if (!courseService) throw new Error(`Course not found with title ${query.courseTitle}`);

			const homeworks = await courseService.getHomeworks() as SigaaHomework[];
			const homework = homeworks.find(h => h.id === homeworkActivity.id);
			if (!homework) throw new Error(`Homework ${homeworkActivity.id} not found`);

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
			console.log(`[${username}: homework - content] - content retrieved`);

			sigaaInstance.close();
			const homeworkDTO = new HomeworkDTO(homework, fileDTO, content, haveGrade, isGroup);
			const courseDTO = courseService.getDTO();
			courseDTO.setAdditionals({ homeworksDTOs: [homeworkDTO] });
			const courseJSON = courseDTO.toJSON();
			const sharedQuery = { courseId: courseJSON.id, homeworkId: homework.id, homeworkTitle: homework.title };
			ResponseCache.setCourseSharedResponse({ event: "homework::content", sharedQuery }, courseJSON, 3600 * 5); // atualiza a cada 5 horas, considerando que é mais volátil
			return this.socketService.emit("homework::content", courseJSON);
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	private getSharedQuery(course: { id: string; }, homework: { id: string; title: string; }) {
		return { courseId: course.id, homeworkId: homework.id, homeworkTitle: homework.title };
	}

	/**
	* Se por algum motivo não tenha o bond.courses, ele requisita ao SIGAA
	*/
	private async getCourseService(bond: IBondDTOProps, courseTitle: string, sigaaInstance: Sigaa): Promise<CourseService> {
		if (bond.courses?.length > 0) {
			const coursesServices = bond.courses.map(course => CourseService.fromDTO(course, sigaaInstance));
			return coursesServices.find(({ course }) => course.title === courseTitle);
		} else {
			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const courses = await bondService.getCourses();
			const coursesServices = courses.map(course => new CourseService(course));
			console.log(`[getCourseService] - ${courses.length} (fetched)`);
			return coursesServices.find(({ course }) => course.title === courseTitle);
		}
	}
}