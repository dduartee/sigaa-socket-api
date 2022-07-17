import { cacheService } from "../services/cacheService";
import { CacheType, cacheUtil, jsonCache } from "../services/cacheUtil";

class CacheHelper {
    /**
     * Armazena cache mergindo com o original
     * @param uniqueID 
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
     * @param query 
     * @returns 
     */
    getNewest(jsonCache, query) {
        const newests: jsonCache[] = jsonCache ? this.sortByDate(jsonCache) : [];
        for (const newest of newests) {
            const diffDateCache = this.diffDateCache(newest.time)
            delete newest.query.cache // Deleta a propriedade de cache
            delete query.cache
            const shallowEqual = (object1, object2) => {
                const keys1 = Object.keys(object1);
                const keys2 = Object.keys(object2);
                if (keys1.length !== keys2.length) return false;
                for (let key of keys1) if (object1[key] !== object2[key]) return false;
                return true;
            }
            const queryEquals = shallowEqual(newest.query, query);
            if (diffDateCache < 6 && queryEquals) {
                return newest
            }
        }
        return;
    }
}

export const cacheHelper = new CacheHelper();