import { CourseStudent, StudentBond } from "sigaa-api";

export class CourseSIGAA {
    async getCourses(bond: StudentBond) {
        const courses = await bond.getCourses();
        return courses;
    }
    async getHomeworks(course: CourseStudent) {
        const homeworkList = await course.getHomeworks()
        return homeworkList;
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
