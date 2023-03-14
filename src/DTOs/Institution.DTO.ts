import { InstitutionData } from "../services/sigaa-api/Institutions.service";

export interface IInstitutionDTOProps {
    name: string;
    acronym: string;
    url: string;
}
export interface IInstitutionDTO {
    toJSON(): IInstitutionDTOProps;
}

export class InstitutionDTO implements IInstitutionDTO {
	constructor(public institution: InstitutionData) { }
	toJSON(): IInstitutionDTOProps {
		return {
			name: this.institution.name,
			acronym: this.institution.acronym,
			url: this.institution.url.href
		};
	}
	static fromJSON(json: IInstitutionDTOProps) {
		return new InstitutionDTO({
			name: json.name,
			acronym: json.acronym,
			url: new URL(json.url)
		});
	}
}