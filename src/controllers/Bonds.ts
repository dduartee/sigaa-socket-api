import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { Socket } from "socket.io";
import { BondDTO, IBondDTOProps } from "../DTOs/Bond.DTO";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import ResponseCache from "../services/cache/ResponseCache";
import BondCache from "../services/cache/BondCache";

interface IBondQuery {
	inactive: boolean;
	cache: boolean;
}

export class Bonds {
	constructor(private socketService: Socket) { }
	async list(query: IBondQuery) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const responseCache = ResponseCache.getResponse<IBondDTOProps>({ uniqueID, event: "bonds::list", query });
			if (query.cache && responseCache) {
				console.log("[bonds - list] - cache hit");
				return this.socketService.emit("bonds::list", responseCache);
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);

			const accountService = new AccountService(account);
			const activeBonds = await accountService.getActiveBonds();
			const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
			const bonds = [...activeBonds, ...inactiveBonds];
			console.log(`[bonds - list] - got ${bonds.length} from SIGAA`);
			const bondsDTOs: BondDTO[] = [];
			for (const bond of bonds) {
				const bondService = new BondService(bond);
				const period = await bondService.getCurrentPeriod();
				const active = activeBonds.includes(bond);
				const sequence = bondService.getSequence();
				const bondDTO = new BondDTO(bond, active, period, sequence);
				bondsDTOs.push(bondDTO);
			}
			sigaaInstance.close();
			const bondsJSON = bondsDTOs.map(b => {
				const bondJSON = b.toJSON();
				BondCache.setBond(uniqueID, bondJSON);
				return bondJSON;
			});
			ResponseCache.setResponse({
				uniqueID,
				event: "bonds::list",
				query
			}, bondsJSON, 3600 * 1.5);
			return this.socketService.emit("bonds::list", bondsJSON);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}
