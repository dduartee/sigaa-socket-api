import NodeCache from "node-cache";
import { BondDTO, IBondDTOProps } from "../../DTOs/Bond.DTO";
import { IActivityDTOProps } from "../../DTOs/Activity.DTO";
class BondCache {
	constructor(private cacheService = new NodeCache({ stdTTL: 5400 })) { }
	setBond(uniqueID: string, bond: IBondDTOProps): void {
		this.cacheService.set(`${uniqueID}-${bond.registration}`, bond);
	}
	setCourses(uniqueID: string, registration: string, courses: IBondDTOProps["courses"]): void {
		const bond = this.getBond(uniqueID, registration);
		if (!bond) throw new Error(`Bond not found with registration ${registration}`);
		const bondDTO = BondDTO.fromJSON({ ...bond, courses })
		this.setBond(uniqueID, bondDTO.toJSON());
	}
	setActivities(uniqueID: string, registration: string, activities: IActivityDTOProps[]): void {
		const bond = this.getBond(uniqueID, registration);
		if (!bond) throw new Error(`Bond not found with registration ${registration}`);
		const bondDTO = BondDTO.fromJSON({ ...bond, activities })
		this.setBond(uniqueID, bondDTO.toJSON());
	}
	getBond(uniqueID: string, registration: string): IBondDTOProps | undefined {
		const bond = this.cacheService.get<IBondDTOProps>(`${uniqueID}-${registration}`);
		return bond;
	}
}

export default new BondCache();