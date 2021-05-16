import { cacheService } from "../services/cacheService";
import { CacheType, cacheUtil, jsonCache } from "../services/cacheUtil";

class Cache {
    /**
     * Armazena cache mergindo com o original
     * @param uniqueID A
     * @param object 
     * @returns 
     */
    storeCache(uniqueID, object: CacheType) {
        return cacheUtil.merge(uniqueID, object)
    }
    /**
     * Resgata cache pelo uniqueID
     * @param uniqueID 
     * @returns 
     */
    getCache(uniqueID): CacheType {
        return cacheService.get(uniqueID)
    }
    /**
     * Reordena o cache de jsons pela data
     * @param jsonCache 
     * @returns 
     */
    sortByDate(jsonCache: jsonCache[]): jsonCache | any {
        const newests = (jsonCache).sort((a, b) => {
            const time1 = new Date(a.time).getTime()
            const time2 = new Date(b.time).getTime()
            return time1 - time2;
        });
        return newests;
    }
    /**
     * Calcula a diferença de tempo entre os caches
     * @param time 
     * @returns 
     */
    diffDateCache(time) {
        const past = new Date(time).getTime()
        const now = new Date().getTime()
        const diff = Math.abs(past - now) / 36e5
        return diff;
    }
    /**
     * Realiza a logica de pegar o cache mais novo
     * @param jsonCache 
     * @param received 
     * @returns 
     */
    getNewest(jsonCache, received) {
        const newests: jsonCache[] = jsonCache ? this.sortByDate(jsonCache) : [];
        for (const newest of newests) {
            if (this.diffDateCache(newest.time) < 6 && newest.received === received) {
                return newest
            }
        }
        return;
    }
}

export const CacheController = new Cache();