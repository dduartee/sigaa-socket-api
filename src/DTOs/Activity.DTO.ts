import { Activity } from "sigaa-api";
export interface IActivityData {
	type: string;
	date: Date;
	done: boolean;
	courseTitle: string;
	examDescription?: string;
	homeworkTitle?: string;
	quizTitle?: string;
}
export interface IActivityDTOProps {
    type: string;
    title: string;
    date: string;
    done: boolean;
    course: { title: string };
}
export interface IActivityDTO {
    toJSON(): IActivityDTOProps;
}

export class ActivityDTO implements IActivityDTO {
	constructor(public activity: IActivityData) { }

	toJSON(): IActivityDTOProps {
		let title = "";
		switch (this.activity.type) {
		case "exam":
			title = this.activity.examDescription;
			break;
		case "homework":
			title = this.activity.homeworkTitle;
			break;
		case "quiz":
			title = this.activity.quizTitle;
			break;
		}
		return {
			type: this.activity.type,
			title,
			date: this.activity.date.toISOString(),
			done: this.activity.done,
			course: { title: this.activity.courseTitle }
		};
	}
	static fromJSON(json: IActivityDTOProps) {
		return new ActivityDTO({
			type: json.type,
			date: new Date(json.date),
			done: json.done,
			courseTitle: json.course.title
		});
	}
}