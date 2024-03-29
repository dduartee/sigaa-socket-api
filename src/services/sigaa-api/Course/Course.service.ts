import { AbsenceList, CourseStudent, CourseStudentData, GradeGroup, Lesson, MemberList, Sigaa, SigaaHomework, SigaaNews, Syllabus } from "sigaa-api";
import { CourseDTO, ICourseDTOProps } from "../../../DTOs/CourseDTO";
import CourseRehydrateService from "./CourseRehydrateService";
import LoggerService from "../../LoggerService";
export class CourseService {
	constructor(public course: CourseStudent) { }
	getDTO(): CourseDTO {
		const courseForm = this.course.getCourseForm();
		const postValues = JSON.stringify(courseForm.postValues);
		return new CourseDTO(this.course, postValues);
	}
	static fromDTO(courseDTOProps: ICourseDTOProps, sigaaInstance: Sigaa): CourseService {
		const form = CourseDTO.getCourseForm(courseDTOProps, sigaaInstance);
		const courseData: CourseStudentData = {
			id: courseDTOProps.id,
			title: courseDTOProps.title,
			code: courseDTOProps.code,
			period: courseDTOProps.period,
			numberOfStudents: courseDTOProps.numberOfStudents,
			schedule: courseDTOProps.schedule,
			form
		};
		const rehydratedCourse = CourseRehydrateService.create(courseData, sigaaInstance);
		return new CourseService(rehydratedCourse);
	}
	async getHomeworks(full = false, retryTimes = 0): Promise<SigaaHomework[]> {
		try {
			const homeworks = await this.course.getHomeworks() as SigaaHomework[];
			return homeworks;
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getHomeworks(full, retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getGrades(retryTimes = 0): Promise <GradeGroup[]> {
		try {
			const grades = await this.course.getGrades();
			return grades;
		} catch(error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getGrades(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getNews(retryTimes = 0): Promise <SigaaNews[]> {
		try {
			const News = await this.course.getNews() as SigaaNews[];
			return News;
		} catch(error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getNews(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getLessons(retryTimes = 0): Promise <Lesson[]> {
		try {
			const lessons = await this.course.getLessons();
			return lessons;
		} catch(error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getLessons(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getAbsences(retryTimes = 0): Promise<AbsenceList | undefined> {
		try {
			const absence = await this.course.getAbsence();
			return absence;
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getAbsences(retryTimes + 1);
			} else {
				return undefined;
			}
		}
	}
	async getMembers(retryTimes = 0): Promise<MemberList | undefined> {
		try {
			const members = await this.course.getMembers();
			return members;
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getMembers(retryTimes + 1);
			} else {
				return undefined;
			}
		}
	}
	async getSyllabus(retryTimes = 0): Promise<Syllabus | undefined> {
		try {
			const syllabus = await this.course.getSyllabus();
			return syllabus;
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getSyllabus(retryTimes + 1);
			} else {
				return undefined;
			}
		}
	}

}
