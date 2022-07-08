import { CourseStudent, StudentBond } from "sigaa-api";

export class CourseSIGAA {
    async getCourses(bond: StudentBond, allPeriods: boolean = false, retryTimes = 0) {
        try {
            const courses = await bond.getCourses(allPeriods);
            return courses;
        } catch (e) {
            console.log(`Error getting courses: ${e} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getCourses(bond, allPeriods, retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getHomeworks(course: CourseStudent, retryTimes = 0) {
        try {
            const homeworkList = await course.getHomeworks()
            return homeworkList;
        } catch (error) {
            console.log(`Error getting homeworks: ${error} @ ${retryTimes}/3`)
            if (retryTimes < 3) {
                return this.getHomeworks(course, retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getGrades(course: CourseStudent, retryTimes = 0) {
        try {
            const grades = await course.getGrades();
            return grades;
        } catch (error) {
            console.log(`Error getting grades: ${error} @ ${retryTimes}/3`)
            if (retryTimes < 3) {
                return this.getGrades(course, retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getNews(course: CourseStudent, retryTimes = 0) {
        try {
            const news = await course.getNews();
            return news;
        } catch (error) {
            console.log(`Error getting news: ${error} @ ${retryTimes}/3`)
            if (retryTimes < 3) {
                return this.getNews(course, retryTimes + 1);
            } else {
                return [];
            }
        }
    }
};
