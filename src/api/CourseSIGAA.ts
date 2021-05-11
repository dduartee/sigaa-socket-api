import { StudentBond } from "sigaa-api";

export class CourseSIGAA {
    async getCourses(bond: StudentBond) {
        const courses = await bond.getCourses();
        return courses;
    }
};
