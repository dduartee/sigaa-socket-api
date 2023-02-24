import NodeCache from "node-cache";
import { IBondDTOProps } from "../../DTOs/Bond.DTO";

class BondCache {
	constructor(private cacheService = new NodeCache({ stdTTL: 5400 })) {}
	setBond(uniqueID: string, bond: IBondDTOProps): void {
		this.cacheService.set(`${uniqueID}-${bond.registration}`, bond);
	}
	getBond(uniqueID: string, registration: string): IBondDTOProps | undefined {
		return this.cacheService.get(`${uniqueID}-${registration}`);
	}
}

export default new BondCache();