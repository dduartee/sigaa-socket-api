import { ActivityDTO, IActivityDTOProps } from "./Activity.DTO";
import { CourseDTO, ICourseDTOProps } from "./CourseDTO";
export interface BondData {
	program: string;
	registration: string;
	type: string;
}
export interface IBondDTOProps extends BondData{
	sequence: number;
	active: boolean;
	period: string;
    activities?: IActivityDTOProps[]
    courses?: ICourseDTOProps[]
}
export interface IBondDTO {
	additionals?: { activitiesDTOs?: ActivityDTO[], coursesDTOs?: CourseDTO[] };
	setAdditionals(additionals: { activitiesDTOs?: ActivityDTO[], coursesDTOs?: CourseDTO[] }): void;
    toJSON(): IBondDTOProps;
}
export class BondDTO implements IBondDTO {
	additionals: { activitiesDTOs?: ActivityDTO[]; coursesDTOs?: CourseDTO[]; };
	constructor(public bond: BondData, public active: boolean, public period: string, public sequence: number) { }
	setAdditionals(additionals: { activitiesDTOs?: ActivityDTO[], coursesDTOs?: CourseDTO[] }) {
		this.additionals = additionals;
	}
	toJSON(): IBondDTOProps {
		const coursesDTOs = this.additionals?.coursesDTOs || [];
		const activitiesDTOs = this.additionals?.activitiesDTOs || [];
		return {
			program: this.bond.program,
			registration: this.bond.registration,
			type: this.bond.type,
			active: this.active,
			period: this.period,
			sequence: this.sequence,
			activities: activitiesDTOs.map(a => a.toJSON()),
			courses: coursesDTOs.map(c => c.toJSON())
		};
	}
	static fromJSON(json: IBondDTOProps) {
		const bondDTO = new BondDTO({
			program: json.program,
			registration: json.registration,
			type: json.type
		}, json.active, json.period, json.sequence);
		bondDTO.setAdditionals({
			activitiesDTOs: json.activities?.map(a => ActivityDTO.fromJSON(a)),
			coursesDTOs: json.courses?.map(c => new CourseDTO(c, c.postValues))
		});
		return bondDTO;
	}
}
