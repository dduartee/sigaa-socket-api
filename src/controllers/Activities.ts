import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import { ActivityDTO } from "../DTOs/Activity.DTO";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { Activity } from "sigaa-api";
import BondCache, { IBondCache } from "../services/cache/BondCache";
import { CourseService } from "../services/sigaa-api/Course/Course.service";

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
			const bonds = BondCache.get<IBondCache[]>(uniqueID);
			if (query.cache && bonds.length > 0) {
				const bond = bonds.find(bond => bond.registration === query.registration);
				if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
				const activities = bond.activities.map(activity => ActivityDTO.fromJSON(activity));
				if (activities.length > 0) {
					console.log(`[activities - list] - ${activities.length} (cached)`);
					return this.socketService.emit("activities::list", bond);
				}
			}
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const bondCached = bonds.find(bond => bond.registration === query.registration);
			if (!bondCached) throw new Error("Data of Bond not stored in cache");

			const bondService = BondService.fromDTO(bondCached, sigaaInstance);
			let coursesServices = bondCached.courses.map(c => CourseService.fromDTO(c, sigaaInstance));
			if (bondCached.courses.length === 0) {
				const courses = await bondService.getCourses();
				coursesServices = courses.map(c => new CourseService(c));
			}
			const activities = await bondService.getActivities();
			console.log(`[activities - list] - got ${activities.length} from ${bondCached.registration}`);
			sigaaInstance.close();
			const activitiesDTOs = await this.getActivitiesDTOs(activities, coursesServices);
			const bondJSON = await this.storeCache(activitiesDTOs, bondCached, uniqueID);
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
	private async storeCache(activitiesDTOs: ActivityDTO[], bondCached: IBondDTOProps, uniqueID: string) {
		const bondDTO = BondDTO.fromJSON(bondCached);
		bondDTO.setAdditionals({ activitiesDTOs });
		const bondJSON = bondDTO.toJSON();
		BondCache.merge(uniqueID, [bondJSON]);
		return bondJSON;
	}
}
