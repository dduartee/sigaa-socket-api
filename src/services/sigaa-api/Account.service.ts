import { Account, BondType, StudentBond } from 'sigaa-api';
class AccountService {
    constructor(private account: Account) { }
    async getFullName(): Promise<string> {
        return await this.account.getName()
    }
    async getProfilePictureURL(): Promise<URL | null> {
        return await this.account.getProfilePictureURL()
    }
    async getEmails(): Promise<string[]> {
        return await this.account.getEmails()
    }
    async getActiveBonds(): Promise<StudentBond[]> {
        const activeBonds = await this.account.getActiveBonds()
        const studentActiveBonds = activeBonds.filter(bond => bond.type === 'student') as StudentBond[];
        return studentActiveBonds;
    }
    async getInactiveBonds() {
        const inactiveBonds = await this.account.getInactiveBonds()
        const studentInactiveBonds = inactiveBonds.filter(bond => bond.type === 'student') as StudentBond[];
        return studentInactiveBonds;
    }
    async logoff() {
        return await this.account.logoff()
    }
};

export { AccountService }
