import { Account, StudentBond } from 'sigaa-api';
export class BondSIGAA {
    async getBonds(account: Account, inactive: boolean) {
        const activeBonds: any = await account.getActiveBonds();
        const inactiveBonds:any = inactive?await account.getInactiveBonds():[]
        const allBonds = [];
        allBonds.push(activeBonds, inactiveBonds)
        return allBonds;
    }
}