import { CourseStudent, CourseStudentData } from "sigaa-api";
import { CourseDTO } from "./CourseDTO";

export interface IActivityData {
	type: string;
	date: Date;
	done: boolean;
	courseTitle: string;
	examDescription?: string;
	homeworkId?: string;
	homeworkTitle?: string;
	quizId?: string;
	quizTitle?: string;
}
export interface IActivityDTOProps {
	id: string;
	title: string;
	type: string;
	date: string;
	done: boolean;
	course: { title: string, id: string };
}
export interface IActivityDTO {
	toJSON(): IActivityDTOProps;
}

export class ActivityDTO implements IActivityDTO {
	constructor(public activity: IActivityData, public course: IActivityDTOProps["course"]) { }

	toJSON(): IActivityDTOProps {
		let title = "";
		let id = "";
		switch (this.activity.type) {
		case "exam":
			title = this.activity.examDescription;
			id = null;
			break;
		case "homework":
			title = this.activity.homeworkTitle;
			id = this.activity.homeworkId;
			break;
		case "quiz":
			title = this.activity.quizTitle;
			id = this.activity.quizId;
			break;
		}
		return {
			id,
			type: this.activity.type,
			title,
			date: this.activity.date.toISOString(),
			done: this.activity.done,
			course: {
				title: this.course.title,
				id: this.course.id
			}
		};
	}
	static fromJSON(json: IActivityDTOProps) {
		return new ActivityDTO({
			type: json.type,
			date: new Date(json.date),
			done: json.done,
			courseTitle: json.course.title,
		}, { id: json.course.id, title: json.course.title });
	}
}