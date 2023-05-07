import NodeCache from "node-cache";
import { ICourseDTOProps } from "../../DTOs/CourseDTO";


interface CacheResponseParams {
  uniqueID: string;
  event: string;
  query: {
    [key: string]: string | boolean | number ;
  };
}

interface SharedCacheResponseParams {
	event: string;
	sharedQuery: {
		[key: string]: string | boolean | number | null;
	}
}

class ResponseCache {
	constructor(private cacheService = new NodeCache()) { }
	setResponse<T>({ uniqueID, event, query }: CacheResponseParams, data: T, stdTTL: number) {
		const queryCleaned = JSON.stringify({
			...query,
			cache: undefined,
			token: undefined
		});
		return this.cacheService.set<T>(`${uniqueID}-${event}-${queryCleaned}`, data, stdTTL);
	}
	getResponse<T>({ uniqueID, event, query }: CacheResponseParams): T | undefined {
		const queryCleaned = JSON.stringify({
			...query,
			cache: undefined,
			token: undefined
		});
		return this.cacheService.get<T>(`${uniqueID}-${event}-${queryCleaned}`);
	}
	setCourseSharedResponse({ event, sharedQuery }: SharedCacheResponseParams, data: ICourseDTOProps, stdTLL: number ): ICourseDTOProps {
		const sharedQueryString = JSON.stringify(sharedQuery);
		const sharedResponse = {...data, timestamp: new Date().toISOString()};
		this.cacheService.set<ICourseDTOProps>(`${event}-${sharedQueryString}`, sharedResponse, stdTLL); // 48 hours
		return sharedResponse;
	}
	/**
	 * Retorna a resposta do cache compartilhado entre os usuários da mesma turma
	 */
	getCourseSharedResponse({ event, sharedQuery }: SharedCacheResponseParams): ICourseDTOProps | undefined {
		const sharedQueryString = JSON.stringify(sharedQuery);
		const sharedResponse = this.cacheService.get<ICourseDTOProps>(`${event}-${sharedQueryString}`);
		return sharedResponse;
	}
	deleteResponses(uniqueID: string): void {
		this.cacheService.keys().forEach(key => {
			if (key.startsWith(uniqueID)) this.cacheService.del(key);
		});
	}
}

export default new ResponseCache();