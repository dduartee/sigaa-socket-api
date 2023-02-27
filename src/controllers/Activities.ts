import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import { ActivityDTO } from "../DTOs/Activity.DTO";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import { Activity } from "sigaa-api";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";

interface IActivitiesQuery {
	cache: boolean;
	registration: string;
	inactive: boolean;
}

export class Activities {
	constructor(private socketService: Socket) { }
	async list(query: IActivitiesQuery) {
		const apiEventError = events.api.error;
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);
			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			const responseCache = ResponseCache.getResponse<IBondDTOProps>({ uniqueID, event: "activities::list", query });
			if (query.cache && responseCache) {
				console.log("[activities - list] - cache hit");
				return this.socketService.emit("activities::list", responseCache);
			}
			
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const activities = await bondService.getActivities();
			console.log(`[activities - list] - got ${activities.length} from ${bond.registration}`);
			sigaaInstance.close();
			const activitiesDTOs = await this.getActivitiesDTOs(activities);
			const activitiesJSON = activitiesDTOs.map(activity => activity.toJSON());
			BondCache.setActivities(uniqueID, bond.registration, activitiesJSON);
			const bondDTO = BondDTO.fromJSON(bond);
			bondDTO.setActivities(activitiesDTOs);
			const bondJSON = bondDTO.toJSON();
			ResponseCache.setResponse({ uniqueID, event: "activities::list", query }, bondJSON, 3600 * 1.5);
			this.socketService.emit("activities::list", bondJSON);
			return;
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return;
		}
	}
	private async getActivitiesDTOs(activities: Activity[]) {
		const activitiesDTOs: ActivityDTO[] = [];
		for (const activity of activities) {
			const activityDTO = new ActivityDTO(activity);
			activitiesDTOs.push(activityDTO);
		}
		return activitiesDTOs;
	}
}
