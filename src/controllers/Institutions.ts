import { Socket } from "socket.io";
import InstitutionsService from "../services/sigaa-api/Institutions.service";
import { InstitutionDTO } from "../DTOs/Institution.DTO";

export class Institutions {
	constructor(private socketService: Socket) { }
	list() {
		const compatibleInstitutions = InstitutionsService.getCompatibleInstitutions();
		const institutionsDTOs = compatibleInstitutions.map(institution => new InstitutionDTO(institution));
		const institutionsJSON = institutionsDTOs.map(institution => institution.toJSON());
		return this.socketService.emit("institutions::list", institutionsJSON);
	}
}