import { Account, StudentBond } from 'sigaa-api';
export class BondSIGAA {
    /**
     * Resgata vinculos ativos e se o parametro inactive for "true" resgata vinculos Inativos
     * @param account Account
     * @param inactive boolean
     * @returns allBonds
     */
    async getBonds(account: Account, inactive: boolean) {
        const activeBonds: any = await account.getActiveBonds();
        const inactiveBonds:any = inactive?await account.getInactiveBonds():[]
        const allBonds = [];
        allBonds.push(activeBonds, inactiveBonds)
        return allBonds;
    }
}