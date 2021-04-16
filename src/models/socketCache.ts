import nodeCache from "node-cache";
import { mergeDeep } from "../util/deepMerge";
interface IsocketCache {
    set(key, value): boolean
    get(key): unknown
    del(key): number
    has(key): boolean
}

export default class socketCache implements IsocketCache {
    nodeCache: nodeCache;
    constructor(params: nodeCache.Options) {
        this.nodeCache = new nodeCache(params)
    }
    /**
     * seta valor na key
     * @param key 
     * @param value 
     * @returns boolean
     */
    set(key: any, value: any): boolean {
        return this.nodeCache.set(key, value)
    }
    /**
     * adiciona valor na key
     * @param key 
     * @param value 
     * @returns object
     */
    append(key: any, value: any) {
        const cache = this.take(key)
        const valueAppend = mergeDeep(cache, value)
        this.set(key, valueAppend);
        return valueAppend;
    }
    get(key: any): any {
        return this.nodeCache.get(key)
    }
    del(key: any): number {
        return (this.nodeCache).del(key);
    }
    take(key: any): object { //get && del
        return (this.nodeCache).take(key)
    }
    has(key: any): boolean {
        return (this.nodeCache).has(key)
    }
}