import { SigaaFile, SigaaHomework } from "sigaa-api";

export class HomeworkService {
	constructor(public homework: SigaaHomework) {}

	/**
     * let file: SigaaFile | null;
			try {
				file = await homework.getAttachmentFile() as SigaaFile;
			} catch (error) {
				file = null;
			}
     */
	async getAttachment(): Promise<SigaaFile | null> {
		let attachment: SigaaFile | null;
		try {
			attachment = await this.homework.getAttachmentFile() as SigaaFile;
		} catch (error) {
			attachment = null;
		}
		return attachment;
	}
}