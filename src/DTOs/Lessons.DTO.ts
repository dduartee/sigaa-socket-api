import { IFileDTOProps } from "./File.DTO";

export interface ILessonDTOProps {
    title: string;
    id: string;
    content: string;
    startDate: Date;
    endDate: Date;
    attachments: IFileDTOProps[] | any[]
}

export interface ILessonDTO {
    toJSON(): ILessonDTOProps;
}

export class LessonDTO implements ILessonDTO {
    constructor(public lesson: any) { }

    toJSON(): ILessonDTOProps {
        return {
            title: this.lesson.title,
            id: this.lesson.id,
            content: this.lesson.contentText,
            startDate: this.lesson.startDate,
            endDate: this.lesson.endDate,
            attachments: this.lesson.attachments.map((attachment: any) => {
                return {
                    id: attachment.id,
                    title: attachment.title,
                    description: attachment.description,
                    key: attachment.key,
                }
            }),
        }
    }
}