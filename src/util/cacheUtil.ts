
import NodeCache from 'node-cache';
import { Account } from 'sigaa-api';
export interface ICacheUtil {
    set<T>(key: string, value: T, ttl: number): boolean

    get<T>(key: string): T | undefined

    linkKeys(keyPrimary: string, ...otherKeys: any[])
}
export type CacheType = {
    account: Account
}
class CacheUtil implements ICacheUtil {
    constructor(protected cacheService = new NodeCache({ useClones: false })) { }

    public set<T>(key: string, value: T, ttl = 5400): boolean {
        return this.cacheService.set(key, value, ttl);
    }

    public get<T>(key: string): T | undefined {
        return this.cacheService.get<T>(key);
    }

    public linkKeys(keyPrimary: string, ...otherKeys: any) {
        otherKeys.forEach(otherKey => {
            this.set(otherKey, keyPrimary)
        });
    }
    public del(key: string): number {
        return this.cacheService.del(key)
    }
    
    public take(key:string): any {
        return this.cacheService.take(key)
    }

    public getStats() {
        return this.cacheService.getStats()
    }
}

export default new CacheUtil();