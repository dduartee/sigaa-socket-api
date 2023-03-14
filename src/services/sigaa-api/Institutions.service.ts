export type InstitutionData = {
	name: string;
	acronym: string;
	url: URL;
};
class InstitutionService {
	institutions: InstitutionData[] = [
		{
			name: "Instituto Federal de Santa Catarina",
			acronym: "IFSC",
			url: new URL("https://sigaa.ifsc.edu.br"),
		},
	];
	getCompatibleInstitutions() {
		return this.institutions;
	}
	getFromAcronym(acronym: string) {
		return this.institutions.find(i => i.acronym === acronym);
	}
}

export default new InstitutionService();