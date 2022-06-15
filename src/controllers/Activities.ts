import { Socket } from "socket.io";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { events } from "../apiConfig.json";
import { cacheHelper } from "../helpers/Cache";
import { BondSIGAA } from "../services/sigaa-api/BondSIGAA";
import { Bonds } from "./Bonds";
import { Activity } from "sigaa-api/dist/activity/sigaa-activity-factory";
import Authentication from "../services/sigaa-api/Authentication";

export class Activities {
  async list(params: { socket: Socket }, received?: jsonCache["received"]) {
    const { socket } = params;

    const eventName = events.activities.list;
    const apiEventError = events.api.error;
    const { inactive } = received;
    try {
      const { cache, uniqueID } = cacheUtil.restore(socket.id);
      const { JSESSIONID, jsonCache } = cache;
      if (received.cache) {
        const newest = cacheHelper.getNewest(jsonCache, received);
        if (newest) {
          return socket.emit(eventName, JSON.stringify(newest["BondsJSON"]));
        }
      }
      const {account, httpSession} = await Authentication.loginWithJSESSIONID(JSESSIONID) 
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
      httpSession.close()
      cacheHelper.storeCache(uniqueID, {
        jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }],
        time: new Date().toISOString(),
      });
      return socket.emit(eventName, JSON.stringify(BondsJSON));
    } catch (error) {
      console.error(error);
      socket.emit(apiEventError, error.message);
      return false;
    }
  }

  static parser({ activity }: { activity: Activity }) {
    let description = "";
    switch (activity.type) {
      case "exam":
        description = activity.examDescription;
        break;
      case "homework":
        description = activity.homeworkTitle;
        break;
      case "quiz":
        description = activity.quizTitle;
        break;
      default:
        break;
    }
    return {
      type: activity.type,
      description,
      date: activity.date.toISOString(),
      course: { title: activity.courseTitle },
      done: activity.done,
    };
  }
}
