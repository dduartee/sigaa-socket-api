import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { BondDTO } from "../DTOs/Bond.DTO";
import { ActivityDTO } from "../DTOs/Activity.DTO";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { Activity } from "sigaa-api";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";

export class Activities {
	constructor(private socketService: Socket) { }
	async list(query: {
		cache: boolean,
		registration: string,
		inactive: boolean,
	}) {
		const apiEventError = events.api.error;
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);
			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			const responseCache = ResponseCache.getResponse({ uniqueID, event: "activities::list", query });
			if (query.cache && responseCache) {
				console.log("[activities - list] - cache hit");
				return this.socketService.emit("activities::list", responseCache);
			}
			
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const bondService = BondService.fromDTO(bond, sigaaInstance);
			let coursesServices = bond.courses.map(c => CourseService.fromDTO(c, sigaaInstance));
			if (bond.courses.length === 0) {
				const courses = await bondService.getCourses();
				coursesServices = courses.map(c => new CourseService(c));
			}
			const activities = await bondService.getActivities();
			console.log(`[activities - list] - got ${activities.length} from ${bond.registration}`);
			sigaaInstance.close();
			const activitiesDTOs = await this.getActivitiesDTOs(activities, coursesServices);
			const bondDTO = BondDTO.fromJSON(bond);
			bondDTO.setAdditionals({ activitiesDTOs });
			const bondJSON = bondDTO.toJSON();
			ResponseCache.setResponse({ uniqueID, event: "activities::list", query }, bondJSON);
			return this.socketService.emit("activities::list", bondJSON);
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
	private async getActivitiesDTOs(activities: Activity[], coursesServices: CourseService[]) {
		const activitiesDTOs: ActivityDTO[] = [];
		for (const activity of activities) {
			const courseService = coursesServices.find(({ course }) => course.title === activity.courseTitle);
			const course = courseService.getDTO().toJSON();
			const activityDTO = new ActivityDTO(activity, course);
			activitiesDTOs.push(activityDTO);
		}
		return activitiesDTOs;
	}
}
