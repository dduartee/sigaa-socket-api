import { Auth } from "../middlewares/Auth";
import { cacheService } from "../services/cacheService";
import { CacheType, cacheUtil, jsonCache } from "../services/cacheUtil";

class Cache {
    storeCache(uniqueID, object) {
        return cacheUtil.merge(uniqueID, object)
    }
    getCache(uniqueID): CacheType {
        return cacheService.get(uniqueID)
    }
    sortByDate(jsonCache: jsonCache[]): jsonCache | any {
        const newest = jsonCache.sort(this.compare);
        const diffDate = this.diffDateCache(newest[0].time);
        if (diffDate < 6) {
            return newest[0];
        }
    }
    compare(a: jsonCache, b: jsonCache) {
        const time1 = new Date(a.time).getTime()
        const time2 = new Date(b.time).getTime()
        return time1 - time2;
    }
    diffDateCache(time) {
        const past = new Date(time).getTime()
        const now = new Date().getTime()
        const diff = Math.abs(past - now) / 36e5
        return diff;
    }
}

export const CacheController = new Cache();