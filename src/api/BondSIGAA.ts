import { Account, StudentBond } from 'sigaa-api';
export class BondSIGAA {
    /**
     * Resgata vinculos ativos e se o parametro inactive for "true" resgata vinculos Inativos
     * @param account Account
     * @param inactive boolean
     * @returns allBonds
     */
    async getBonds(account: Account, inactive?: boolean): Promise<StudentBond[]> {
        const activeBonds: any = await account.getActiveBonds();
        const inactiveBonds:any = inactive?await account.getInactiveBonds():[]
        const bonds: StudentBond[] = []
        for (const activeBond of activeBonds) {
            bonds.push(activeBond);
        }
        for (const inactiveBond of inactiveBonds) {
            bonds.push(inactiveBond);
        }
        await account.getActiveBonds();
        return bonds;
    }
}