import { Account } from "sigaa-api";
import merge from "ts-deepmerge";
import { session } from "../controllers/Session";
import { cacheService } from "./cacheService";
export type CacheType = {
    account: Account,
    jsonCache: [jsonCache]
}
export type jsonCache = {
    BondsJSON: JSON,
    received: any,
    time: string
}
class CacheUtil {
    restore(sid: string) {
        const uniqueID: string = session.read(sid);
        const cache: CacheType = cacheService.get(uniqueID)
        return { cache, uniqueID };
    }
    merge(key: string, obj: {}) {
        const cache: any = cacheService.get(key) ?? []
        const cacheMerged: CacheType = merge(cache, obj)
        cacheService.set(key, cacheMerged)
        return cacheMerged;
    }
}
export const cacheUtil = new CacheUtil()