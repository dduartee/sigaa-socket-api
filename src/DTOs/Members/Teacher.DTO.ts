import { Teacher } from "sigaa-api";
import { IUserDTOProps } from "../User.DTO";

export interface ITeacherDTOProps extends IUserDTOProps {
    formation?: string;
    department?: string;
}

export interface ITeacherDTO {
    toJSON(): ITeacherDTOProps;
}

export class TeacherDTO implements ITeacherDTO {
	constructor(public teacher: Teacher) {}

	toJSON(): ITeacherDTOProps {
		return {
			username: this.teacher.username,
			fullName: this.teacher.name,
			emails: [this.teacher.email],
			profilePictureURL: this.teacher.photoURL.href,
			formation: this.teacher.formation,
			department: this.teacher.department
		};
	}
}
