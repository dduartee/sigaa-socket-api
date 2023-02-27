import { CourseStudent,  GradeGroup, Lesson, MemberList, SigaaHomework, SigaaNews} from "sigaa-api";
import { FullHomework } from "../../DTOs/Homework.DTO";
export class CourseService {
	constructor(private course: CourseStudent) { }
	async getHomeworks(full = false, retryTimes = 0) {
		try {
			const homeworks = await this.course.getHomeworks() as SigaaHomework[];
			const homeworksParsed: FullHomework[] = [];
			for (const homework of homeworks) {
				let content: string;
				let haveGrade: boolean;
				let isGroup: boolean;
				if (full) {
					content = await homework.getDescription();
					haveGrade = await homework.getFlagHaveGrade();
					isGroup = await homework.getFlagIsGroupHomework();
				}
				homeworksParsed.push({
					id: homework.id,
					title: homework.title,
					content: content,
					startDate: homework.startDate,
					endDate: homework.endDate,
					haveGrade: haveGrade,
					isGroup
				});
			}
			return homeworksParsed;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getHomeworks(full, retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getGrades(retryTimes = 0): Promise<GradeGroup[]> {
		try {
			const grades = await this.course.getGrades();
			return grades;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getGrades(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getNews(retryTimes = 0): Promise<SigaaNews[]> {
		try {
			const news = await this.course.getNews() as SigaaNews[];
			return news;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getNews(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getLessons(retryTimes = 0): Promise<Lesson[]> {
		try {
			const lessons = await this.course.getLessons();
			return lessons;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getLessons(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getAbsences(retryTimes = 0) {
		try {
			const absence = await this.course.getAbsence();
			return absence;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getAbsences(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getMembers(retryTimes = 0): Promise<MemberList> {
		try {
			const members = await this.course.getMembers();
			return members;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getMembers(retryTimes + 1);
			} else {
				return null;
			}
		}
	}
	async getSyllabus(retryTimes = 0) {
		try {
			const syllabus = await this.course.getSyllabus();
			return syllabus;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getSyllabus(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	
}
