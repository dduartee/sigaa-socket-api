import { CourseStudent } from "sigaa-api";

export interface ICourseDTOProps {
    id: string;
    title: string;
    code: string;
    schedule?: string;
    period: string;
    numberOfStudents: number;
}
export interface ICourseDTO {
    toJSON(): ICourseDTOProps;
}
export class CourseDTO implements ICourseDTO {
    constructor(public course: CourseStudent) { }

    toJSON(): ICourseDTOProps {
        return {
            id: this.course.id,
            title: this.course.title,
            code: this.course.code,
            schedule: this.course.schedule,
            period: this.course.period,
            numberOfStudents: this.course.numberOfStudents
        }
    }
}
