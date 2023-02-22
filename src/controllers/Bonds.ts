import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { BondDTO } from "../DTOs/Bond.DTO";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import BondCache, { IBondCache } from "../services/cache/BondCache";

export class Bonds {
	constructor(private socketService: Socket) { }
	async list(query: {
		inactive: boolean;
		cache: boolean
	}) {
		const apiEventError = events.api.error;
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);
			const bondsCached = BondCache.get<IBondCache[]>(uniqueID);
			if (query.cache && bondsCached.length > 0) {
				const bonds = bondsCached.map(bond => BondDTO.fromJSON(bond));
				console.log(`[bonds - list] - got ${bonds.length} (cached)`);
				return this.socketService.emit("bonds::list", bonds.map(b => b.toJSON()));
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);

			const accountService = new AccountService(account);
			const activeBonds = await accountService.getActiveBonds();
			const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
			const bonds = [...activeBonds, ...inactiveBonds];
			console.log(`[bonds - list] - got ${bonds.length} from SIGAA`);
			const BondsDTOs: BondDTO[] = [];
			for (const bond of bonds) {
				console.log("[bonds - list] - getting current period for", bond.registration);
				const bondService = new BondService(bond);
				const period = await bondService.getCurrentPeriod();
				const active = activeBonds.includes(bond);
				const sequence = bondService.getSequence();
				const bondDTO = new BondDTO(bond, active, period, sequence);
				BondsDTOs.push(bondDTO);
			}
			sigaaInstance.close();
			const bondsJSON = BondsDTOs.map(b => b.toJSON());
			BondCache.merge(uniqueID, bondsJSON);
			console.log("[bonds - list] - finished");
			return this.socketService.emit("bonds::list", bondsJSON);
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}
