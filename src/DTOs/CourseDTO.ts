import { AbsencesDTO, IAbsencesDTOProps } from "./Absences.DTO";
import { GradeGroupDTO, IGradeGroupDTOProps } from "./GradeGroup/GradeGroup.DTO";
import { HomeworkDTO, IHomeworkDTOProps } from "./Homework.DTO";
import { ILessonDTOProps, LessonDTO } from "./Lessons.DTO";
import { INewsDTOProps, NewsDTO } from "./News.DTO";
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
	news?: INewsDTOProps[]
	homeworks?: IHomeworkDTOProps[];
	absences?: IAbsencesDTOProps
	lessons?: ILessonDTOProps[]
}
export interface ICourseDTO {
	toJSON(): ICourseDTOProps;
}
export class CourseDTO implements ICourseDTO {
	additionals: { gradeGroupsDTOs?: GradeGroupDTO[]; newsDTOs?: NewsDTO[]; homeworksDTOs?: HomeworkDTO[]; absencesDTO?: AbsencesDTO; lessonsDTOs?: LessonDTO[]; };
	constructor(
		public course: ICourseData,
		public postValues: string,
	) { }
	setAdditionals(additionals: {
		gradeGroupsDTOs?: GradeGroupDTO[],
		newsDTOs?: NewsDTO[],
		homeworksDTOs?: HomeworkDTO[],
		absencesDTO?: AbsencesDTO,
		lessonsDTOs?: LessonDTO[]
	}) {
		this.additionals = additionals;
	}
	toJSON(): ICourseDTOProps {
		const gradeGroupsDTOs = this.additionals?.gradeGroupsDTOs || [];
		const newsDTOs = this.additionals?.newsDTOs || [];
		const homeworksDTOs = this.additionals?.homeworksDTOs || [];
		const lessonsDTOs = this.additionals?.lessonsDTOs || [];
		const absencesDTO = this.additionals?.absencesDTO || undefined;
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
			absences: absencesDTO?.toJSON()
		};
	}
	static getCourseForm(course: ICourseDTOProps) {
		const action = new URL("https://sigaa.ifsc.edu.br/sigaa/portais/discente/turmas.jsf"); // a url de ação do formulário de matérias é fixa (eu acho)
		const form = { action, postValues: JSON.parse(course.postValues), };  // os dados do formulário são salvos como string no banco de dados
		return form;
	}
	// static fromJSON(json: ICourseDTOProps) {}
}
