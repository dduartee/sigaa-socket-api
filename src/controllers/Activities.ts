import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import { ActivityDTO, IActivityData } from "../DTOs/Activity.DTO";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import BondCache from "../services/cache/BondCache";
import ResponseCache from "../services/cache/ResponseCache";
import LoggerService from "../services/LoggerService";

interface IActivitiesQuery {
	cache: boolean;
	registration: string;
	inactive: boolean;
}

export class Activities {
	constructor(private socketService: Socket) { }
	async list(query: IActivitiesQuery) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL, username } = SessionMap.get<ISessionMap>(uniqueID);
			const bond = BondCache.getBond(uniqueID, query.registration);
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);

			const responseCache = ResponseCache.getResponse<IBondDTOProps>({ uniqueID, event: "activities::list", query });
			if (query.cache && responseCache) {
				return this.socketService.emit("activities::list", responseCache);
			}
			
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);

			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const campus = await bondService.getCampus();
			LoggerService.log(`[${username}: activities - list] - access from ${campus}`);
			const activities = await bondService.getActivities();
			LoggerService.log(`[${username}: activities - list] - got ${activities.length}`);
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
			return;
		}
	}
	private async getActivitiesDTOs(activities: IActivityData[]) {
		const activitiesDTOs: ActivityDTO[] = [];
		for (const activity of activities) {
			const activityDTO = new ActivityDTO(activity);
			activitiesDTOs.push(activityDTO);
		}
		return activitiesDTOs;
	}
}
