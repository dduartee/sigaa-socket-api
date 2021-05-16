import { CourseStudent, StudentBond } from "sigaa-api";

export class CourseSIGAA {
    async getCourses(bond: StudentBond) {
        const courses = await bond.getCourses();
        return courses;
    }
    async getHomeworks(course: CourseStudent) {
        try {
            const homeworkList = await course.getHomeworks()
            return homeworkList;
        } catch (error) {
            console.error(error)
            return [];
        }
    }
};
