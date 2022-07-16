import { Activity, CourseStudent, StudentBond } from "sigaa-api";
import RetryService from "../Retry.service";
export class BondService {
  constructor(private bond: StudentBond) { }
  async getActivities() {
    const activities = await RetryService.retry<Activity[]>(async () => await this.bond.getActivities(), []);
    return activities;
  }
  async getCourses(allPeriods = false) {
    const courses = await RetryService.retry<CourseStudent[]>(async () => await this.bond.getCourses(allPeriods), []);
    return courses;
  }
  async getCurrentPeriod() {
    const currentPeriod = await RetryService.retry<string>(async () => await this.bond.getCurrentPeriod(), 0);
    return currentPeriod;
  }
}
