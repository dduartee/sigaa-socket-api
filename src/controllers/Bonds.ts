import { cacheUtil } from "../services/cacheUtil";
import { cacheHelper } from "../helpers/Cache";
import { events } from "../apiConfig.json";
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { Socket } from "socket.io";
import { BondDTO } from "../DTOs/Bond.DTO";
export class Bonds {
  constructor(private socketService: Socket) { }
  async list(query: {
    inactive: boolean;
    cache: boolean
  }) {
    const apiEventError = events.api.error;
    try {
      const { cache, uniqueID } = cacheUtil.restore(this.socketService.id);
      const { JSESSIONID, jsonCache } = cache;
      if(!JSESSIONID) {
        throw new Error("API: No JSESSIONID found in cache.");
      }
      if (query.cache) {
        const newest = cacheHelper.getNewest(jsonCache, query);
        if (newest) {
          const bonds = newest["BondsJSON"];
          console.log(newest);
          return this.socketService.emit("bonds::list", bonds);
        }
      }
      const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID, cache.sigaaURL)
      const accountService = new AccountService(account);
      const activeBonds = await accountService.getActiveBonds();
      const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
      const bonds = [...activeBonds, ...inactiveBonds];
      console.log(`[bonds - list] - ${bonds.length}`)
      const BondsDTOs: BondDTO[] = []
      for (const bond of bonds) {
        const bondService = new BondService(bond)
        const period = await bondService.getCurrentPeriod()
        const active = activeBonds.includes(bond);
        const bondDTO = new BondDTO(bond, active, period);
        BondsDTOs.push(bondDTO)
      }
      httpSession.close()
      const BondsJSON = BondsDTOs.map(b => b.toJSON())
      cacheHelper.storeCache(uniqueID, {
        jsonCache: [{ BondsJSON , query, time: new Date().toISOString() }],
        time: new Date().toISOString(),
      });
      return this.socketService.emit("bonds::list", BondsJSON);
    } catch (error) {
      console.error(error);
      this.socketService.emit(apiEventError, error.message);
      return false;
    }
  }
}
