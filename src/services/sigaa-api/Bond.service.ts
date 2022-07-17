import { Activity, CourseStudent, StudentBond } from "sigaa-api";
export class BondService {
  constructor(private bond: StudentBond) { }
  async getActivities() {
    const activities = await this.bond.getActivities()
    return activities;
  }
  async getCourses(allPeriods = false) {
    const courses = await this.bond.getCourses(allPeriods)
    return courses;
  }
  async getCurrentPeriod() {
    const currentPeriod = await this.bond.getCurrentPeriod()
    return currentPeriod;
  }
}
