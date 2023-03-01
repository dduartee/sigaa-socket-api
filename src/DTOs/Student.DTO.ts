import { BondDTO, IBondDTOProps } from "./Bond.DTO";

export interface StudentData {
	username: string;
	fullName: string;
	emails: string[];
	profilePictureURL: string;
}
export interface IStudentDTOProps extends StudentData {
	bonds: IBondDTOProps[];
}
export interface IStudentDTO {
	
	setAdditionals(bondsDTOs: BondDTO[]): void;
	toJSON(): IStudentDTOProps;
}
export class StudentDTO implements IStudentDTO {
	bonds: BondDTO[] = [];
	constructor(public student: StudentData) { }
	setAdditionals(bondsDTOs: BondDTO[]) {
		this.bonds = bondsDTOs;
	}

	toJSON(): IStudentDTOProps {
		return {
			username: this.student.username,
			fullName: this.student.fullName,
			emails: this.student.emails,
			profilePictureURL: this.student.profilePictureURL,
			bonds: this.bonds.map(b => b.toJSON())
		};
	}
	static fromJSON(json: IStudentDTOProps) {
		const studentDTO = new StudentDTO({
			username: json.username,
			fullName: json.fullName,
			emails: json.emails,
			profilePictureURL: json.profilePictureURL
		});
		studentDTO.setAdditionals(json.bonds.map(b => new BondDTO(b, b.active, b.period, b.sequence)));
	}
}