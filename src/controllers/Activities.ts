import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { Socket } from "socket.io";
import { BondDTO } from "../DTOs/Bond.DTO";
import { ActivityDTO } from "../DTOs/Activity.DTO";
import SessionMap from "../services/SessionMap";
import SocketReferenceMap from "../services/SocketReferenceMap";
import StudentMap from "../services/StudentMap";

export class Activities {
	constructor(private socketService: Socket) { }
	async list(query: {
    cache: boolean,
    registration: string,
    inactive: boolean,
  }) {
		const apiEventError = events.api.error;
		try {
			const uniqueID = SocketReferenceMap.get(this.socketService.id);
			const cache = SessionMap.get(uniqueID);
			const { JSESSIONID } = cache;
			// if (query.cache) {
			// 	const newest = cacheHelper.getNewest(jsonCache, query);
			// 	if (newest) {
			// 		const bond = newest["BondsJSON"].find(b => b.registration === query.registration);
			// 		return this.socketService.emit("activities::list", bond);
			// 	}
			// }

			const sigaaURL = new URL(cache.sigaaURL);
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);

			const accountService = new AccountService(account);

			const activeBonds = await accountService.getActiveBonds();
			const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
			const bonds = [...activeBonds, ...inactiveBonds];

			const bond = bonds.find(bond => bond.registration === query.registration);
			const bondService = new BondService(bond);

			const period = await bondService.getCurrentPeriod();
			const activities = await bondService.getActivities();
			console.log(`[activities - list] - ${activities.length}`);
			sigaaInstance.close();
			const activitiesDTOs = activities.map(activity => new ActivityDTO(activity));
			const active = activeBonds.includes(bond);
			const bondDTO = new BondDTO(bond, active, period);
			bondDTO.setAdditionals({ activitiesDTOs });
			const bondJSON = bondDTO.toJSON();
			StudentMap.merge(uniqueID, {
				bonds: [bondJSON],
			});
			return this.socketService.emit("activities::list", bondJSON);
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}
