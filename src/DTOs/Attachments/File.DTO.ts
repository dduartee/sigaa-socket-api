import { SigaaFile } from "sigaa-api";

export interface IFileDTOProps {
    id: string;
    title: string;
    description: string;
    key: string;
	downloadPath: string;
}
export interface IFileDTO {
    toJSON(): IFileDTOProps;
}

export class FileDTO implements IFileDTO {
	constructor(public file: SigaaFile) {}
	toJSON(): IFileDTOProps {
		if(!this.file.key) throw new Error("FileDTO - file.key is undefined");
		const downloadPath = `/sigaa/verProducao?idProducao=${this.file.id}&key=${this.file.key}`;
		return {
			id: this.file.id,
			title: this.file.title || "",
			description: this.file.description || "",
			key: this.file.key,
			downloadPath
		};
	}
}