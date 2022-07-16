import { Activity } from "sigaa-api";

export interface IActivityDTOProps {
    type: string;
    description: string;
    date: string;
    done: boolean;
    course: { title: string };
}
export interface IActivityDTO {
    toJSON(): IActivityDTOProps;
}

export class ActivityDTO implements IActivityDTO {
    constructor(public activity: Activity) { }

    toJSON(): IActivityDTOProps {
        let description = "";
        switch (this.activity.type) {
            case "exam":
                description = this.activity.examDescription;
                break;
            case "homework":
                description = this.activity.homeworkTitle;
                break;
            case "quiz":
                description = this.activity.quizTitle;
                break;
        }
        return {
            type: this.activity.type,
            description,
            date: this.activity.date.toISOString(),
            done: this.activity.done,
            course: { title: this.activity.courseTitle }
        }
    }
}