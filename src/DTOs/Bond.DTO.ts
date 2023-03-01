import { CourseService } from "../services/sigaa-api/Course/Course.service";
import { ActivityDTO, IActivityDTOProps } from "./Activity.DTO";
import { CourseDTO, ICourseDTOProps } from "./CourseDTO";
export interface BondData {
	program: string;
	registration: string;
	type: string;
}
export interface IBondDTOProps extends BondData {
	sequence: number;
	active: boolean;
	period: string;
	activities: IActivityDTOProps[] | undefined;
	courses: ICourseDTOProps[] | undefined;
}
export interface IBondDTO {
	additionals?: { activitiesDTOs?: ActivityDTO[], coursesDTOs?: CourseDTO[] };
	setActivities(activities: ActivityDTO[]): void;
	setCourses(courses: CourseDTO[]): void;
	toJSON(): IBondDTOProps;
}
export class BondDTO implements IBondDTO {
	additionals: { activitiesDTOs: ActivityDTO[] | undefined; coursesDTOs: CourseDTO[] | undefined; };
	constructor(public bond: BondData, public active: boolean, public period: string, public sequence: number) {
		this.additionals = {
			activitiesDTOs: undefined,
			coursesDTOs: undefined
		};
	}
	setActivities(activities: ActivityDTO[]) {
		this.additionals.activitiesDTOs = activities;
	}
	setCourses(courses: CourseDTO[]) {
		this.additionals.coursesDTOs = courses;
	}
	toJSON(): IBondDTOProps {
		const activities = this.additionals.activitiesDTOs? this.additionals.activitiesDTOs.map(a => a.toJSON()) : undefined;
		const courses = this.additionals.coursesDTOs? this.additionals.coursesDTOs.map(c => c.toJSON()) : undefined;
		return {
			program: this.bond.program,
			registration: this.bond.registration,
			type: this.bond.type,
			active: this.active,
			period: this.period,
			sequence: this.sequence,
			activities,
			courses
		};
	}
	static fromJSON(json: IBondDTOProps) {
		const bondDTO = new BondDTO({
			program: json.program,
			registration: json.registration,
			type: json.type
		}, json.active, json.period, json.sequence);
		const activitiesDTOs = json.activities?.map(a => ActivityDTO.fromJSON(a));
		const coursesDTOs = json.courses?.map(c => new CourseDTO(c, c.postValues));
		bondDTO.setActivities(activitiesDTOs);
		bondDTO.setCourses(coursesDTOs);
		return bondDTO;
	}
}
