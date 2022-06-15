import { CourseStudent } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../services/sigaa-api/BondSIGAA";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { events } from "../apiConfig.json";
import { Homeworks } from "./Homeworks";
import { News } from "./News";
import { CourseSIGAA } from "../services/sigaa-api/CourseSIGAA";
import Authentication from "../services/sigaa-api/Authentication";
export class Courses {
  /**
   * Lista matérias de um vinculo especificado pelo registration
   * @param params socket
   * @param received registration
   * @returns
   */
  async list(params: { socket: Socket }, received: jsonCache["received"]) {
    const { socket } = params;
    const eventName = events.courses.list;
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
      for (const bond of bonds) {
        if (bond.registration == received.registration) {
          const courses = await new CourseSIGAA().getCourses(bond);
          const CoursesJSON = [];
          for (const course of courses) {
            CoursesJSON.push(Courses.parser({ course }));
          }
          BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
          cacheHelper.storeCache(uniqueID, {
            jsonCache: [
              { BondsJSON, received, time: new Date().toISOString() },
            ],
            time: new Date().toISOString(),
          });
          return socket.emit(eventName, JSON.stringify(BondsJSON));
        }
      }
    } catch (error) {
      console.error(error);
      socket.emit(apiEventError, error.message);
      return false;
    }
  }
  /**
   * Lista detalhes de uma matéria especificado pelo code
   * @param params socket
   * @param received registration
   * @returns
   */
  async details(params: { socket: Socket }, received: jsonCache["received"]) {
    const { socket } = params;
    const eventName = events.courses.details;
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
      for (const bond of bonds) {
        if (bond.registration == received.registration) {
          const courses = await new CourseSIGAA().getCourses(bond);
          const CoursesJSON = [];
          for (const course of courses) {
            if (course.code == received.code) {
              const homeworksList = await new CourseSIGAA().getHomeworks(
                course
              );
              const homeworks = await Homeworks.parser(
                homeworksList,
                received.fullDetails
              );
              const gradesGroups = await new CourseSIGAA().getGrades(course);
              const grades = gradesGroups;
              const newsList = await new CourseSIGAA().getNews(course);
              const news = await News.parser(newsList, received.fullDetails);
              CoursesJSON.push(
                Courses.parser({ course, grades, news, homeworks })
              );
              BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
              cacheHelper.storeCache(uniqueID, {
                jsonCache: [
                  { BondsJSON, received, time: new Date().toISOString() },
                ],
                time: new Date().toISOString(),
              });
              httpSession.close()
              return socket.emit(eventName, JSON.stringify(BondsJSON));
            }
          }
        }
      }
      httpSession.close()
    } catch (error) {
      console.error(error);
      socket.emit(apiEventError, error.message);
      return false;
    }
  }

  /**
   * Parser da matéria
   * @param params
   * @returns
   */
  static parser(params: {
    course: CourseStudent;
    news?: any;
    grades?: any;
    homeworks?: any;
  }) {
    const { course, grades, homeworks, news } = params;
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      period: course.period,
      schedule: course.schedule,
      news: news ?? [],
      grades: grades ?? [],
      homeworks: homeworks ?? [],
    };
  }
}
