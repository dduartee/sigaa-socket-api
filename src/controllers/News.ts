import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { Socket } from "socket.io";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";
import LoggerService from "../services/LoggerService";
import { INewsData, INewsProps, NewsDTO } from "../DTOs/News.DTO";
import { CourseCommonController } from "./CourseCommonController";

interface INewsQuery {
    inactive: boolean;
    cache: boolean,
    registration: string,
    courseId: string,
	full: boolean
}
export class News extends CourseCommonController {
	constructor(private socketService: Socket) {
		super();
	}
	async list(query: INewsQuery) {
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
					const responseCache = ResponseCache.getCourseSharedResponse({ event: "news::content", sharedQuery });
					if (responseCache) {
						return this.socketService.emit("news::content", responseCache);
					}
				}
			} else {
				LoggerService.log("[news - content] - bond.courses is undefined (?????)");
			}
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const courseService = await this.getCourseService(bond, query.courseId, sigaaInstance);
			if (!courseService) throw new Error(`Course not found with id ${query.courseId}`);

			const News = await courseService.getNews();
			LoggerService.log(`[${username}: news - content] - News fetched`);
			const newsDTOs: NewsDTO[] = [];
			for (const news of News) {
				const newsProps: INewsProps = { 
					id: news.id,
					title: news.title
				};
				if(!query.full) {
					const newsDTO = new NewsDTO(newsProps);
					newsDTOs.push(newsDTO);
				} else {
					const content = await news.getContent();
					const date = await news.getDate();
					const newsData: INewsData = {
						content,
						date
					};
					newsDTOs.push(new NewsDTO(newsProps, newsData));
				}
			}
			sigaaInstance.close();
			const courseDTO = courseService.getDTO();
			courseDTO.setAdditionals({ newsDTOs });
			const courseJSON = courseDTO.toJSON();

			const sharedQuery = this.getSharedQuery(courseJSON);
			const sharedResponse = ResponseCache.setCourseSharedResponse({ event: "news::content", sharedQuery }, courseJSON, 3600 * 336); // 14 dias
			return this.socketService.emit("news::content", sharedResponse);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
	
}