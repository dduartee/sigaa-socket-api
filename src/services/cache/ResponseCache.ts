import NodeCache from "node-cache";


class ResponseCache {
	constructor(private cacheService = new NodeCache({ stdTTL: 5400 })) { }
	setResponse<T>({ uniqueID, event, query }, data: T) {
		const params = JSON.stringify({
			...query,
			cache: undefined,
			token: undefined
		});
		return this.cacheService.set<T>(`${uniqueID}-${event}-${params}`, data);
	}
	getResponse<T>({ uniqueID, event, query }): T | undefined {
		const params = JSON.stringify({
			...query,
			cache: undefined,
			token: undefined
		});
		return this.cacheService.get<T>(`${uniqueID}-${event}-${params}`);
	}
	setSharedResponse<T>({ event, sharedQuery }, data: T) {
		return this.cacheService.set<T>(`${event}-${JSON.stringify(sharedQuery)}`, data, 3600 * 4);
	}
	getSharedResponse<T>({ event, sharedQuery }): T | undefined {
		return this.cacheService.get<T>(`${event}-${JSON.stringify(sharedQuery)}`);
	}
}

export default new ResponseCache();