import { NewsData, News as NEWS } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../services/sigaa-api/BondSIGAA";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";
import { events } from "../apiConfig.json"
import { CourseSIGAA } from "../services/sigaa-api/CourseSIGAA";

export class News {
    async list( params: { socket: Socket }, received: jsonCache["received"] ) {
        const { socket } = params;
        const eventName = events.homeworks.specific;
        const apiEventError = events.api.error;
        const { inactive } = received;
        try {

            const { cache, uniqueID } = cacheUtil.restore( socket.id );
            if ( !cache.account ) throw new Error( "Usuario não tem account" )
            const { account, jsonCache } = cache
            if ( received.cache ) {
                const newest = cacheHelper.getNewest( jsonCache, received )
                if ( newest ) {
                    return socket.emit( eventName, JSON.stringify( newest["BondsJSON"] ) )
                }
            }

            const bonds = await new BondSIGAA().getBonds( account, inactive );
            const BondsJSON = [];

            for ( const bond of bonds ) {
                const courses = await new CourseSIGAA().getCourses( bond );
                const CoursesJSON = [];
                for ( const course of courses ) {

                    if ( received.code == course.code ) {
                        const newsList = await new CourseSIGAA().getNews( course )
                        const news = await News.parser( newsList, received.fullNews )
                        CoursesJSON.push( Courses.parser( { course, news } ) )
                        BondsJSON.push( Bonds.parser( { bond, CoursesJSON } ) );
                        cacheHelper.storeCache( uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() } )
                        return socket.emit( eventName, JSON.stringify( BondsJSON ) );
                    }

                }
            }
        } catch ( error ) {
            console.error( error );
            socket.emit( apiEventError, error.message )
            return false;
        }
    }

    static async parser( newsList: any[], full?: boolean ) {
        const newsJSON = [];
        for ( const news of newsList ) {
            newsJSON.push( {
                id: news.id,
                title: news.title,
                description: full ? await news.getContent() : "",
                date: full ? ( await news.getDate() ).toISOString() : "",
            } );
        }
        return newsJSON;
    }
}