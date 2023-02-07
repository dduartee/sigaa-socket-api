
import NodeCache from "node-cache";
import { IBondDTOProps } from "../DTOs/Bond.DTO";
import { IUserDTOProps } from "../DTOs/User.DTO";
import merge from "ts-deepmerge";

export interface ICacheStructure {
	options: {
		username: string;
		JSESSIONID: string;
		// currentRegistration: string;
		sigaaURL: string;
	},
	user: IUserDTOProps;
	bonds: IBondDTOProps[]
	updatedAt: string;
}

class CacheService extends NodeCache {
	constructor(options: NodeCache.Options) {
		super(options);
	}
	/**
	 * merge new data into cache
	 */
	update<T>(key: string, value: Partial<T>) {
		const cache = cacheService.get(key) ?? [];
		const cacheMerged = merge(cache, value);
		cacheService.set(key, cacheMerged);
		return cacheMerged;
	}
}

const cacheService = new CacheService({ useClones: false, stdTTL: 7200 });

export { cacheService };