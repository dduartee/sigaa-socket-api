import { Activity, CourseStudent, Sigaa, StudentBond } from "sigaa-api";
import BondRehydrateFactory from "./BondRehydrateFactory";
import { IBondDTOProps } from "../../../DTOs/Bond.DTO";

export class BondService {
	constructor(private bond: StudentBond) { }
	/**
	 * Retorna a instancia de BondService a partir de um IBondDTOProps, rehydratando a classe StudentBond
	 */
	static fromDTO(bondDTO: IBondDTOProps, sigaaInstance: Sigaa): BondService {
		const rehydratedBond = BondRehydrateFactory.create({
			program: bondDTO.program,
			registration: bondDTO.registration,
			sequence: bondDTO.sequence,
		}, sigaaInstance);
		console.log(`[BondService - fromDTO] - rehydrated bond: ${rehydratedBond.registration}`);
		return new BondService(rehydratedBond);
	}
	getSequence() {
		const bondSwitchUrl = this.bond.bondSwitchUrl;
		const sequence = bondSwitchUrl.searchParams.get("vinculo") || ""; // ordem sequencial do vinculo
		return parseInt(sequence);
	}
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
			// const mockActivities: Partial<Activity>[] = [
			// 	{
			// 		courseTitle: "HISTÓRIA III",
			// 		courseId: "178932",
			// 		date: new Date(),
			// 		done: true,
			// 		homeworkId: "49686859",
			// 		homeworkTitle: "Atividade Avaliativa 3° Trimestre",
			// 		type: "homework"
			// 	}
			// ];
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
