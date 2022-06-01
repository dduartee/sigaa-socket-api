import { Homework, SigaaHomework, StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import { BondSIGAA } from "../services/sigaa-api/BondSIGAA";
import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";
import { events } from "../apiConfig.json"
import { CourseSIGAA } from "../services/sigaa-api/CourseSIGAA";
export class Homeworks {
    /**
     * Lista homeworks de uma máteria especificado pelo code
     * @param params socket
     * @param received code
     * @returns 
     */
    async specific( params: { socket: Socket }, received: jsonCache["received"] ) {
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
                const CoursesJSON = [];
                const courses = await new CourseSIGAA().getCourses( bond );
                for ( const course of courses ) {
                    if ( course.code == received.code ) {
                        const homeworksList: any = await new CourseSIGAA().getHomeworks( course )
                        const homeworks = await Homeworks.parser( homeworksList, received.fullHW );
                        CoursesJSON.push( Courses.parser( { course, homeworks } ) )
                        BondsJSON.push( Bonds.parser( { bond, CoursesJSON } ) );
                        cacheHelper.storeCache( uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() } )
                        return socket.emit( eventName, JSON.stringify( BondsJSON ) );
                    }
                }
            }
            throw new Error( "Nothing found with code: " + received.code )

        } catch ( error ) {
            console.error( error );
            socket.emit( apiEventError, error.message )
            return false;
        }
    }
    /**
     * Lista homeworks de todas as matérias de um vinculo especificado pelo registration
     * @param params 
     * @param received 
     * @returns 
     */
    async list( params: { socket: Socket }, received: jsonCache["received"] ) {
        const { socket } = params;
        const eventName = events.homeworks.list;
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
                if ( bond.registration == received.registration ) {
                    const CoursesJSON = [];
                    const courses = await new CourseSIGAA().getCourses( bond );
                    for ( const course of courses ) {
                        const homeworksList: any = await new CourseSIGAA().getHomeworks( course )
                        const homeworks = await Homeworks.parser( homeworksList, received.fullHW );
                        CoursesJSON.push( Courses.parser( { course, homeworks } ) )
                        socket.emit( "homeworks::listPartial", JSON.stringify( [Bonds.parser( { bond, CoursesJSON } )] ) )
                    }
                    BondsJSON.push( Bonds.parser( { bond, CoursesJSON } ) );
                }
            }
            cacheHelper.storeCache( uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], time: new Date().toISOString() } )
            return socket.emit( eventName, JSON.stringify( BondsJSON ) );

        } catch ( error ) {
            console.error( error );
            socket.emit( apiEventError, error.message )
            return false;
        }
    }
    static async parser( homeworkList: any[], full?: boolean ) {
        const homeworks = [];
        for ( const homework of homeworkList ) {
            const description = full ? ( await homework.getDescription() ) : null;
            const haveGrade = full ? ( await homework.getFlagHaveGrade() ) : null;
            const isGroup = full ? ( await homework.getFlagIsGroupHomework() ) : null;
            const startDate = homework.startDate;
            const endDate = homework.endDate;
            const title = homework.title;
            homeworks.push( {
                title,
                description,
                startDate,
                isGroup,
                endDate,
                haveGrade,
            } );
        }
        return homeworks;
    }
}