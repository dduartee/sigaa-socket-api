import { File } from "sigaa-api";

export type FullHomework = {
    id: string,
    title: string,
    content?: string,
    startDate: Date,
    endDate: Date,
    haveGrade?: boolean,
    isGroup?: boolean,
}
export interface IHomeworkDTOProps {
    id: string,
    title: string,
    startDate: string,
    endDate: string,
    haveGrade?: boolean,
    isGroup?: boolean,
    content?: string
}

export interface IHomeworkDTO {
    toJSON(): IHomeworkDTOProps;
}
export class HomeworkDTO implements IHomeworkDTO {
    constructor(public homework: FullHomework) { }

    toJSON(): IHomeworkDTOProps {
        return {
            id: this.homework.id,
            title: this.homework.title,
            content: this.homework.content,
            startDate: this.homework.startDate.toISOString(),
            endDate: this.homework.endDate.toISOString(),
            haveGrade: this.homework.haveGrade,
            isGroup: this.homework.isGroup,
        }
    }
}