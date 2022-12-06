import { CourseStudent } from "sigaa-api";
import { AbsencesDTO, IAbsencesDTOProps } from "./Absences.DTO";
import { GradeGroupDTO, IGradeGroupDTOProps } from "./GradeGroup/GradeGroup.DTO";
import { HomeworkDTO, IHomeworkDTOProps } from "./Homework.DTO";
import { ILessonDTOProps, LessonDTO } from "./Lessons.DTO";
import { INewsDTOProps, NewsDTO } from "./News.DTO";

export interface ICourseDTOProps {
    id: string;
    title: string;
    code: string;
    schedule?: string;
    period: string;
    numberOfStudents: number;
    grades?: IGradeGroupDTOProps[];
    news?: INewsDTOProps[]
    homeworks?: IHomeworkDTOProps[];
    absences?: IAbsencesDTOProps
    lessons?: ILessonDTOProps[]
}
export interface ICourseDTO {
    toJSON(): ICourseDTOProps;
}
export class CourseDTO implements ICourseDTO {
	constructor(
        public course: CourseStudent,
        public additionals?: {
            gradeGroupsDTOs?: GradeGroupDTO[],
            newsDTOs?: NewsDTO[],
            homeworksDTOs?: HomeworkDTO[],
            absencesDTO?: AbsencesDTO,
            lessonsDTOs?: LessonDTO[]
        }
	) { }

	toJSON(): ICourseDTOProps {
		const gradeGroupsDTOs = this.additionals?.gradeGroupsDTOs || [];
		const newsDTOs = this.additionals?.newsDTOs || [];
		const homeworksDTOs = this.additionals?.homeworksDTOs || [];
		const lessonsDTOs = this.additionals?.lessonsDTOs || [];
		return {
			id: this.course.id,
			title: this.course.title,
			code: this.course.code,
			schedule: this.course.schedule,
			period: this.course.period,
			numberOfStudents: this.course.numberOfStudents,
			grades: gradeGroupsDTOs.map(dto => dto.toJSON()),
			news: newsDTOs.map(dto => dto.toJSON()),
			homeworks: homeworksDTOs.map(dto => dto.toJSON()),
			lessons: lessonsDTOs.map(dto => dto.toJSON()),
			absences: this.additionals?.absencesDTO?.toJSON()
		};
	}
}
