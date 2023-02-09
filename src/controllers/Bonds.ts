import { CacheType, cacheUtil } from "../services/cacheUtil";
import { cacheHelper } from "../helpers/Cache";
import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { Socket } from "socket.io";
import { BondDTO } from "../DTOs/Bond.DTO";
import { cacheService } from "../services/cacheService";
export class Bonds {
	constructor(private socketService: Socket) { }
	async list(query: {
    inactive: boolean;
    cache: boolean
  }) {
		const apiEventError = events.api.error;
		try {
			const uniqueID = cacheService.get<string>(this.socketService.id);
			const cache = cacheService.get<CacheType>(uniqueID);
			const { JSESSIONID, jsonCache } = cache;
			if (query.cache) {
				const newest = cacheHelper.getNewest(jsonCache, query);
				if (newest) {
					const bonds = newest["BondsJSON"];
					return this.socketService.emit("bonds::list", bonds);
				}
			}

			const sigaaURL = new URL(cache.sigaaURL);
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);

			const accountService = new AccountService(account);
			const activeBonds = await accountService.getActiveBonds();
			const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
			const bonds = [...activeBonds, ...inactiveBonds];
			console.log(`[bonds - list] - ${bonds.length}`);
			const BondsDTOs: BondDTO[] = [];
			for (const bond of bonds) {
				const bondService = new BondService(bond);
				const period = await bondService.getCurrentPeriod();
				const active = activeBonds.includes(bond);
				const bondDTO = new BondDTO(bond, active, period);
				BondsDTOs.push(bondDTO);
			}
			sigaaInstance.close();
			const BondsJSON = BondsDTOs.map(b => b.toJSON());
			cacheUtil.merge(uniqueID, {
				jsonCache: [{ BondsJSON , query, time: new Date().toISOString() }],
				time: new Date().toISOString(),
			});
			return this.socketService.emit("bonds::list", BondsJSON);
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}
