import { IStudentDTOProps, StudentDTO } from "./Student.DTO";
import { ITeacherDTOProps, TeacherDTO } from "./Teacher.DTO";

export interface IMembersDTOProps {
    teachers: ITeacherDTOProps[];
    students: IStudentDTOProps[];
}

export interface IMembersDTO {
    toJSON(): IMembersDTOProps;
}

export class MembersDTO implements IMembersDTO {

	constructor(private teachersDTOs: TeacherDTO[], private studentsDTOs: StudentDTO[]) {    }

	toJSON(): IMembersDTOProps {
		return {
			teachers: this.teachersDTOs.map(t => t.toJSON()),
			students: this.studentsDTOs.map(s => s.toJSON()),
		};
	}
}