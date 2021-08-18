import { Socket } from "socket.io";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { events } from "../apiConfig.json";
import { cacheHelper } from "../helpers/Cache";
import { BondSIGAA } from "../api/BondSIGAA";
import { Bonds } from "./Bonds";
import { FrontPageActivities } from "sigaa-api";

export class Activities {
  async list(params: { socket: Socket }, received?: jsonCache["received"]) {
    const { socket } = params;

    const eventName = events.activities.list;
    const apiEventError = events.api.error;
    const { inactive } = received;
    try {
      const { cache, uniqueID } = cacheUtil.restore(socket.id);
      if (!cache.account) throw new Error("Usuario não tem account");
      const { account, jsonCache } = cache;
      if (received.cache) {
        const newest = cacheHelper.getNewest(jsonCache, received);
        if (newest) {
          return socket.emit(eventName, JSON.stringify(newest["BondsJSON"]));
        }
      }
      const bonds = await new BondSIGAA().getBonds(account, inactive);
      const BondsJSON = [];
      const ActivitiesJSON = [];
      for (const bond of bonds) {
        if (received.registration === bond.registration) {
          const activities = await new BondSIGAA().getActivities(bond);
          for (const activity of activities) {
            ActivitiesJSON.push(Activities.parser({ activity }));
          }
          BondsJSON.push(Bonds.parser({ bond, ActivitiesJSON }));
        }
      }
      cacheHelper.storeCache(uniqueID, {
        account,
        jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }],
        rawCache: { bonds },
        time: new Date().toISOString(),
      });
      return socket.emit(eventName, JSON.stringify(BondsJSON));
    } catch (error) {
      console.error(error);
      socket.emit(apiEventError, error.message);
      return false;
    }
  }
  /**
   * Parser de Bonds
   * @param params {bond: StudentBond, courses?: CourseStudent[]}
   * @returns program, registration, courses
   */
  static parser({ activity }: { activity: FrontPageActivities }) {
    return {
      course: activity.course,
      title: activity.title,
      date: activity.date,
      done: activity.done,
    };
  }
}
