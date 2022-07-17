import { StudentBond } from "sigaa-api";
import { ActivityDTO, IActivityDTOProps } from "./Activity.DTO";
import { CourseDTO, ICourseDTOProps } from "./CourseDTO";

export interface IBondDTOProps {
    program: string;
    registration: string;
    type: string;
    active: boolean;
    period: string;
    activities?: IActivityDTOProps[]
    courses?: ICourseDTOProps[]
}
export interface IBondDTO {
    toJSON(additionals: {
        activitiesDTOs?: ActivityDTO[];
        coursesDTOs?: CourseDTO[];
    }): IBondDTOProps;
}
export class BondDTO implements IBondDTO {
    constructor(public bond: StudentBond, public active: boolean, public period: string, public additionals?: { activitiesDTOs?: ActivityDTO[], coursesDTOs?: CourseDTO[] }) { }

    toJSON(): IBondDTOProps {
        const coursesDTOs = this.additionals?.coursesDTOs || [];
        const activitiesDTOs = this.additionals?.activitiesDTOs || [];
        return {
            program: this.bond.program,
            registration: this.bond.registration,
            type: this.bond.type,
            active: this.active,
            period: this.period,
            activities: activitiesDTOs.map(a => a.toJSON()),
            courses: coursesDTOs.map(c => c.toJSON())
        }
    }
}
