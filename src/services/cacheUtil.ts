import merge from "ts-deepmerge";
import { IBondDTOProps } from "../DTOs/Bond.DTO";
import { cacheService } from "./cacheService";
export type CacheType = {
    jsonCache?: jsonCache[],
    username: string,
    JSESSIONID: string,
    registration?: string,
    sigaaURL: string,
    time?: string
}
export type jsonCache = {
    BondsJSON: IBondDTOProps[],
    query: {
        [key: string]: string | number | boolean
    }
    time: string
}

class CacheUtil {
	/**
     * Merge cache existente com o novo
     * @param key 
     * @param obj 
     * @returns 
     */
	merge(key: string, obj: Partial<CacheType>) {
		const cache = cacheService.get<CacheType>(key) ?? [];
		const cacheMerged: CacheType = merge(cache, obj);
		cacheService.set(key, cacheMerged);
		return cacheMerged;
	}
}
export const cacheUtil = new CacheUtil();