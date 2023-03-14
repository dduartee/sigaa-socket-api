import { Sigaa } from "sigaa-api";
import { AbsencesDTO, IAbsencesDTOProps } from "./Absences.DTO";
import { GradeGroupDTO, IGradeGroupDTOProps } from "./GradeGroup/GradeGroup.DTO";
import { HomeworkDTO, IHomeworkDTOProps } from "./Homework.DTO";
import { ILessonDTOProps, LessonDTO } from "./Lessons.DTO";
import { INewsDTOProps, NewsDTO } from "./News.DTO";
import { ISyllabusDTOProps, SyllabusDTO } from "./Syllabus.DTO";
export interface ICourseData {
	id: string;
	title: string;
	code: string;
	schedule?: string;
	period: string;
	numberOfStudents: number;
}
export interface ICourseDTOProps extends ICourseData {
	postValues: string;
	grades?: IGradeGroupDTOProps[];
	news?: INewsDTOProps[];
	homeworks?: IHomeworkDTOProps[];
	absences?: IAbsencesDTOProps;
	lessons?: ILessonDTOProps[];
	syllabus?: ISyllabusDTOProps;
}
export interface ICourseAdditionals {
	gradeGroupsDTOs?: GradeGroupDTO[],
	newsDTOs?: NewsDTO[],
	homeworksDTOs?: HomeworkDTO[],
	lessonsDTOs?: LessonDTO[],
	absencesDTO?: AbsencesDTO,
	syllabusDTO?: SyllabusDTO
}
export interface ICourseDTO {
	toJSON(): ICourseDTOProps;
}
export class CourseDTO implements ICourseDTO {
	additionals: ICourseAdditionals;
	constructor(
		public course: ICourseData,
		public postValues: string,
	) { }
	setAdditionals(additionals: ICourseAdditionals) {
		this.additionals = additionals;
	}
	toJSON(): ICourseDTOProps {
		const gradeGroupsDTOs = this.additionals?.gradeGroupsDTOs || [];
		const newsDTOs = this.additionals?.newsDTOs || [];
		const homeworksDTOs = this.additionals?.homeworksDTOs || [];
		const lessonsDTOs = this.additionals?.lessonsDTOs || [];
		const absencesDTO = this.additionals?.absencesDTO || undefined;
		const syllabusDTO = this.additionals?.syllabusDTO || undefined;
		return {
			id: this.course.id,
			title: this.course.title,
			code: this.course.code,
			schedule: this.course.schedule,
			period: this.course.period,
			numberOfStudents: this.course.numberOfStudents,
			postValues: this.postValues,
			grades: gradeGroupsDTOs.map(dto => dto.toJSON()),
			news: newsDTOs.map(dto => dto.toJSON()),
			homeworks: homeworksDTOs.map(dto => dto.toJSON()),
			lessons: lessonsDTOs.map(dto => dto.toJSON()),
			absences: absencesDTO?.toJSON(),
			syllabus: syllabusDTO?.toJSON(),
		};
	}
	static getCourseForm(course: ICourseDTOProps, sigaaInstance: Sigaa) {
		const action = sigaaInstance.httpSession.getURL("/sigaa/portais/discente/turmas.jsf");
		const form = { action, postValues: JSON.parse(course.postValues), };  // os dados do formulário são salvos como string no banco de dados
		return form;
	}
	// static fromJSON(json: ICourseDTOProps) {}
}
