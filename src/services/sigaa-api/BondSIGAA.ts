import { Account, StudentBond } from "sigaa-api";
export class BondSIGAA {
  /**
   * Resgata vinculos ativos e se o parametro inactive for "true" resgata vinculos Inativos
   * @param account Account
   * @param inactive boolean
   * @returns allBonds
   */
  async getBonds(account: Account, inactive?: boolean): Promise<StudentBond[]> {
    try {
      const activeBonds: any = await account.getActiveBonds();
      const inactiveBonds: any = inactive
        ? await account.getInactiveBonds()
        : [];
      const bonds: StudentBond[] = [];
      for (const activeBond of activeBonds) {
        bonds.push(activeBond);
      }
      for (const inactiveBond of inactiveBonds) {
        bonds.push(inactiveBond);
      }
      return bonds;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getActivities(bond: StudentBond, retryTimes = 0) {
    try {
      const activities = await bond.getActivities();
      return activities;
    } catch (error) {
      console.log(`Error getting activities: ${error}`);
      if (retryTimes < 3) {
        return this.getActivities(bond, retryTimes + 1);
      } else {
        return [];
      }
    }
  }
}
