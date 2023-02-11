import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { Socket } from "socket.io";
import { BondDTO } from "../DTOs/Bond.DTO";
import SocketReferenceMap from "../services/SocketReferenceMap";
import SessionMap from "../services/SessionMap";
import StudentMap from "../services/StudentMap";

export class Bonds {
	constructor(private socketService: Socket) { }
	async list(query: {
		inactive: boolean;
		cache: boolean
	}) {
		const apiEventError = events.api.error;
		try {
			const uniqueID = SocketReferenceMap.get(this.socketService.id);
			const cache = SessionMap.get(uniqueID);
			const { JSESSIONID } = cache;
			if (query.cache && StudentMap.has(uniqueID)) {
				const student = StudentMap.get(uniqueID);
				const bonds = student.bonds.map(bond => BondDTO.fromJSON(bond));
				return this.socketService.emit("bonds::list", bonds.map(b => b.toJSON()));
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
			const bondsJSON = BondsDTOs.map(b => b.toJSON());
			StudentMap.merge(uniqueID, { bonds: bondsJSON });
			return this.socketService.emit("bonds::list", bondsJSON);
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}
