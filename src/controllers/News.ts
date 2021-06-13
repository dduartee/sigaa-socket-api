import { NewsData, News as NEWS } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../api/BondSIGAA";
import { CourseSIGAA } from "../api/CourseSIGAA";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";

export class News {
    event: {
        list: {
            name: string
        },
        specific: {
            name: string
        }
    }
    constructor() {
        this.event = {
            list: {
                name: "news::list"
            },
            specific: {
                name: "news::specific"
            }
        }
    }
    async specific(params: { socket: Socket }, received: jsonCache["received"]) {
        try {
            const { socket } = params;
            const { specific } = this.event;
            const eventName = specific.name;

            const { cache, uniqueID } = cacheUtil.restore(socket.id);
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            if (received.cache) {
                const newest = cacheHelper.getNewest(jsonCache, received)
                if (newest) {
                    return socket.emit(eventName, JSON.stringify(newest["BondsJSON"]))
                }
            }

            const bonds = await new BondSIGAA().getBonds(account, true);
            const BondsJSON = [];

            for (const bond of bonds) {
                const courses = await new CourseSIGAA().getCourses(bond);
                const CoursesJSON = [];
                for (const course of courses) {

                    if (received.code == course.code) {
                        const newsList = await new CourseSIGAA().getNews(course)
                        const news = await News.parser(newsList, received.fullNews)
                        CoursesJSON.push(Courses.parser({ course, news }))
                        BondsJSON.push(Bonds.parser({ bond, CoursesJSON }));
                        cacheHelper.storeCache(uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() })
                        return socket.emit(eventName, JSON.stringify(BondsJSON));
                    }

                }
            }
        } catch (error) {
            console.error(error)
            return false;
        }
    }

    static async parser(newsList: any[], full?: boolean) {
        const newsJSON = [];
        for (const news of newsList) {
            newsJSON.push({
                id: news.id,
                title: news.title,
                description: full ? await news.getContent() : "",
                date: full ? (await news.getDate()).toISOString() : "",
            });
        }
        return newsJSON;
    }
}