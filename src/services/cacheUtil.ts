import { Account, CourseStudent, Homework, StudentBond } from "sigaa-api";
import merge from "ts-deepmerge";
import { session } from "../helpers/Session";
import { cacheService } from "./cacheService";
export type CacheType = {
    jsonCache?: jsonCache[],
    JSESSIONID?: string,
    registration?: string,
    time?: string
}
export type jsonCache = {
    BondsJSON: any[],
    received: {
        registration?: string,
        code?: string,
        inactive?: boolean,
        fullHW?: boolean,
        fullNews?: boolean,
        fullDetails?: boolean
        limit?: number
        cache?: boolean
    },
    time: string
}

class CacheUtil {
    /**
     * Restaura cache pelo socket.id retornando o cache e uniqueID
     * @param sid 
     * @returns 
     */
    restore(sid: string) {
        const uniqueID: string = session.read(sid);
        const cache: CacheType = cacheService.get(uniqueID)
        return { cache, uniqueID };
    }
    /**
     * Merge cache existente com o novo
     * @param key 
     * @param obj 
     * @returns 
     */
    merge(key: string, obj: CacheType) {
        const cache: any = cacheService.get(key) ?? []
        const cacheMerged: CacheType = merge(cache, obj)
        cacheService.set(key, cacheMerged)
        return cacheMerged;
    }
}
export const cacheUtil = new CacheUtil()