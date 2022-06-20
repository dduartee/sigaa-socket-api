import { CourseStudent, StudentBond } from "sigaa-api";

export class CourseSIGAA {
    async getCourses(bond: StudentBond, allPeriods: boolean = false) {
        const courses = await bond.getCourses(allPeriods);
        return courses;
    }
    async getHomeworks(course: CourseStudent) {
        try {
            const homeworkList = await course.getHomeworks()
            return homeworkList;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    async getGrades(course: CourseStudent) {
        try {
            const grades = await course.getGrades();
            return grades;
        } catch (error) {
            console.error(error)
            return [];
        }
    }
    async getNews(course: CourseStudent) {
        try {
            const news = await course.getNews();
            return news;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
};
