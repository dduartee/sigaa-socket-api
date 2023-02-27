import { Student } from "sigaa-api";
import { IUserDTOProps } from "../User.DTO";

export interface IStudentDTOProps extends IUserDTOProps {
    registrationDate: string;
}

export interface IStudentDTO {
    toJSON(): IStudentDTOProps;
}

export class StudentDTO implements IStudentDTO {
	constructor(public student: Student) {}

	toJSON(): IStudentDTOProps {
		return {
			username: this.student.username,
			fullName: this.student.name,
			emails: [this.student.email],
			profilePictureURL: this.student.photoURL.href,
			registrationDate: this.student.registrationDate.toISOString()
		};
	}
}