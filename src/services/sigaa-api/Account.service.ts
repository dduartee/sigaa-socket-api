import { Account, BondType, StudentBond } from 'sigaa-api';
import RetryService from '../Retry.service';
class AccountService {
    constructor(private account: Account) { }
    async getFullName(): Promise<string> {
        return RetryService.retry<string>(async () => await this.account.getName(), "");
    }
    async getProfilePictureURL(): Promise<URL | null> {
        return RetryService.retry<URL | null>(async () => await this.account.getProfilePictureURL(), null);
    }
    async getEmails(): Promise<string[]> {
        return RetryService.retry<string[]>(async () => await this.account.getEmails(), []);
    }
    async getActiveBonds(): Promise<StudentBond[]> {
        const activeBonds = await RetryService.retry<BondType[]>(async () => await this.account.getActiveBonds(), [])
        const studentActiveBonds = activeBonds.filter(bond => bond.type === 'student') as StudentBond[];
        return studentActiveBonds;
    }
    async getInactiveBonds() {
        const inactiveBonds = await RetryService.retry<BondType[]>(async () => await this.account.getInactiveBonds(), [])
        const studentInactiveBonds = inactiveBonds.filter(bond => bond.type === 'student') as StudentBond[];
        return studentInactiveBonds;
    }
    async logoff() {
        return RetryService.retry<void>(async () => await this.account.logoff(), null);
    }
};

export { AccountService }
