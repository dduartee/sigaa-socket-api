import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { StudentBond } from "sigaa-api";
import { BondSIGAA } from "../services/sigaa-api/BondSIGAA";
import { Socket } from "socket.io";
import { cacheHelper } from "../helpers/Cache";
import { events } from "../apiConfig.json";
import Authentication from "../services/sigaa-api/Authentication";
export class Bonds {
  /**
   * Lista vinculos com inativos opcional
   * @param params {socket}
   * @param received {inactive}
   * @returns
   */
  async list(params: { socket: Socket }, received?: jsonCache["received"]) {
    const { socket } = params;

    const eventName = events.bonds.list;
    const apiEventError = events.api.error;
    const { inactive, registration } = received;
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
      for (const bond of bonds) {
        BondsJSON.push(Bonds.parser({ bond }));
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
  /**
   * Parser de Bonds
   * @param params {bond: StudentBond, courses?: CourseStudent[]}
   * @returns program, registration, courses
   */
  static parser({
    bond,
    CoursesJSON,
    ActivitiesJSON,
  }: {
    bond: StudentBond;
    CoursesJSON?: any;
    ActivitiesJSON?: any;
  }) {
    return {
      program: bond.program,
      registration: bond.registration,
      courses: CoursesJSON ?? [],
      activities: ActivitiesJSON ?? [],
    };
  }
}
