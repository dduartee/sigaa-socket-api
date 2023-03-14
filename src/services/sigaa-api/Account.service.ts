import { Account, StudentBond } from "sigaa-api";
import LoggerService from "../LoggerService";
class AccountService {
	constructor(private account: Account) { }
	async getFullName(retryTimes = 0): Promise<string | null> {
		try {
			return await this.account.getName();
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getFullName(retryTimes + 1);
			} else {
				return null;
			}
		}
	}
	async getProfilePictureURL(retryTimes = 0): Promise<URL | null> {
		try {
			return await this.account.getProfilePictureURL();
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getProfilePictureURL(retryTimes + 1);
			} else {
				return null;
			}
		}
	}
	async getEmails(retryTimes = 0): Promise<string[]> {
		try {
			return await this.account.getEmails();
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getEmails(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getActiveBonds(retryTimes = 0): Promise<StudentBond[]> {
		try {

			const activeBonds = await this.account.getActiveBonds();
			const studentActiveBonds = activeBonds.filter(bond => bond.type === "student") as StudentBond[];
			return studentActiveBonds;
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getActiveBonds(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async getInactiveBonds(retryTimes = 0): Promise<StudentBond[]> {
		try {
			const inactiveBonds = await this.account.getInactiveBonds();
			const studentInactiveBonds = inactiveBonds.filter(bond => bond.type === "student") as StudentBond[];
			return studentInactiveBonds;
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.getInactiveBonds(retryTimes + 1);
			} else {
				return [];
			}
		}
	}
	async logoff(retryTimes = 0) {
		try {
			return await this.account.logoff();
		} catch (error) {
			LoggerService.log(`Error: ${error} @ ${retryTimes}/3`);
			if (retryTimes < 3) {
				return this.logoff(retryTimes + 1);
			} else {
				return;
			}
		}
	}
}

export { AccountService };
