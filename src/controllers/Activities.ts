import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { events } from "../apiConfig.json";
import { cacheHelper } from "../helpers/Cache";
import { Bonds } from "./Bonds";
import { Activity } from "sigaa-api/dist/activity/sigaa-activity-factory";
import Authentication from "../services/sigaa-api/Authentication.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { Socket } from "socket.io";
import { BondDTO } from "../DTOs/Bond.DTO";
import { ActivityDTO } from "../DTOs/Activity.DTO";

export class Activities {
  constructor(private socketService: Socket) { }
  async list(query: {
    cache: boolean,
    registration: string,
    inactive: boolean,
  }) {
    const eventName = events.activities.list;
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
          const bond = newest["BondsJSON"].find(b => b.registration === query.registration);
          return this.socketService.emit(eventName, bond);
        }
      }
      const { account, httpSession } = await Authentication.loginWithJSESSIONID(JSESSIONID)
      const accountService = new AccountService(account);

      const activeBonds = await accountService.getActiveBonds();
      const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
      const bonds = [...activeBonds, ...inactiveBonds];

      const bond = bonds.find(bond => bond.registration === query.registration);
      const bondService = new BondService(bond);

      const period = await bondService.getCurrentPeriod()
      const activities = await bondService.getActivities();

      httpSession.close()

      const activitiesDTOs = activities.map(activity => new ActivityDTO(activity));
      const active = activeBonds.includes(bond);
      const bondDTO = new BondDTO(bond, active, period, { activitiesDTOs });
      const bondJSON = bondDTO.toJSON()
      cacheHelper.storeCache(uniqueID, {
        jsonCache: [{ BondsJSON: [bondJSON], query, time: new Date().toISOString() }],
        time: new Date().toISOString(),
      });
      return this.socketService.emit(eventName, bondJSON);
    } catch (error) {
      console.error(error);
      this.socketService.emit(apiEventError, error.message);
      return false;
    }
  }
}
