import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { Socket } from "socket.io";
import { HomeworkDTO } from "../DTOs/Homework.DTO";
import { SigaaHomework } from "sigaa-api";
import { FileDTO } from "../DTOs/Attachments/File.DTO";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";
import LoggerService from "../services/LoggerService";
import { CourseCommonController } from "./CourseCommonController";
import { HomeworkService } from "../services/sigaa-api/Course/Homework.service";

type IHomeworkQuery = {
	inactive: boolean,
	cache: boolean,
	registration: string,
	courseTitle?: string,
	homeworkId?: string
	homeworkTitle?: string,
}
export class Homeworks extends CourseCommonController {
	constructor(private socketService: Socket) {
		super();
	}
	/**
	 * Lista homeworks de todas as matérias de um vinculo especificado pelo registration
	 * @param params 
	 * @param query 
	 * @returns 
	 */
	async content(query: IHomeworkQuery) {
		try {

			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id) as string;
			const { JSESSIONID, sigaaURL, username } = SessionMap.get<ISessionMap>(uniqueID) as ISessionMap;

			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			if (!query.courseTitle) throw new Error("Course title is required");
			/**
			 * para ver o conteudo da matéria, é necessário que ele tenha atividades carregadas
			 */
			if (bond.activities === undefined) throw new Error(`Bond ${query.registration} has no activities loaded`);

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
				LoggerService.log("[homework - content] - bond.courses is undefined (?????)");
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const homeworkActivity = bond.activities.find(a => a.type === "homework" && a.title === query.homeworkTitle && a.id === query.homeworkId);
			if (!homeworkActivity) throw new Error(`Homework ${query.homeworkId} not found`);

			const courseService = await this.getCourseService(bond, query.courseTitle, sigaaInstance);
			if (!courseService) throw new Error(`Course not found with title ${query.courseTitle}`);

			const homeworks = await courseService.getHomeworks() as SigaaHomework[];
			const homework = homeworks.find(h => h.id === homeworkActivity.id);
			if (!homework) throw new Error(`Homework ${homeworkActivity.id} not found`);
			const homeworkService = new HomeworkService(homework);

			const file = await homeworkService.getAttachment();
			let fileDTO: FileDTO | null = null;
			if(file) {
				fileDTO = new FileDTO(file);
			}
			
			const content = await homework.getDescription();
			const haveGrade = await homework.getFlagHaveGrade();
			const isGroup = await homework.getFlagIsGroupHomework();
			LoggerService.log(`[${username}: homework - content] - content retrieved`);

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

}