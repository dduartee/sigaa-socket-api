import { Activity, CourseStudent, StudentBond } from "sigaa-api";
export class BondService {
	constructor(private bond: StudentBond) { }
	async getCampus(retryTimes = 0): Promise<string> {
		try {
			const campus = await this.bond.getCampus();
			return campus;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getCampus(retryTimes + 1);
			} else {
				return "";
			}
		}
	}
	async getActivities(retryTimes = 0): Promise<Activity[]> {
		try {

			const activities = await this.bond.getActivities();
			return activities;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getActivities(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getCourses(allPeriods = false, retryTimes = 0): Promise<CourseStudent[]> {
		try {
			const courses = await this.bond.getCourses(allPeriods);
			return courses;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getCourses(allPeriods, retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getCurrentPeriod(retryTimes = 0): Promise<string> {
		try {
			const currentPeriod = await this.bond.getCurrentPeriod();
			return currentPeriod;
		} catch (error) {
			console.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getCurrentPeriod(retryTimes + 1);
			} else {
				return "";
			}
		}
	}
}
