import { CourseStudent, StudentBond } from "sigaa-api";
import RetryService from "../Retry.service";

export class CourseService {
    constructor(private course: CourseStudent) { }
    async getHomeworks() {
        return RetryService.retry(
            async () => {
                const homeworkList = await this.course.getHomeworks()
                return homeworkList;
            }, [])
    }
    async getGrades() {
        return RetryService.retry(
            async () => {
                const grades = await this.course.getGrades();
                return grades;
            }, [])
    }
    async getNews() {
        return RetryService.retry(
            async () => {
                const news = await this.course.getNews();
                return news;
            }, [])
    }
    async getLessons() {
        return RetryService.retry(
            async () => {
                const lessons = await this.course.getLessons();
                return lessons;
            }, [])
    }
    async getAbsence() {
        return RetryService.retry(
            async () => {
                const absence = await this.course.getAbsence();
                return absence;
            }, [])
    }
    async getMembers() {
        return RetryService.retry(
            async () => {
                const members = await this.course.getMembers();
                return members;
            }, [])
    }
    async getSyllabus() {
        return RetryService.retry(
            async () => {
                const syllabus = await this.course.getSyllabus();
                return syllabus;
            }, [])
    }

};
