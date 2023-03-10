import NodeCache from "node-cache";
import { ICourseDTOProps } from "../../DTOs/CourseDTO";


class ResponseCache {
	constructor(private cacheService = new NodeCache()) { }
	setResponse<T>({ uniqueID, event, query }, data: T, stdTTL: number) {
		const params = JSON.stringify({
			...query,
			cache: undefined,
			token: undefined
		});
		return this.cacheService.set<T>(`${uniqueID}-${event}-${params}`, data, stdTTL);
	}
	getResponse<T>({ uniqueID, event, query }): T | undefined {
		const params = JSON.stringify({
			...query,
			cache: undefined,
			token: undefined
		});
		return this.cacheService.get<T>(`${uniqueID}-${event}-${params}`);
	}
	setCourseSharedResponse(params: { event: string, sharedQuery }, data: ICourseDTOProps, stdTLL: number ): ICourseDTOProps {
		const sharedQuery = JSON.stringify(params.sharedQuery);
		const sharedResponse = {...data, timestamp: new Date().toISOString()};
		this.cacheService.set<ICourseDTOProps>(`${params.event}-${sharedQuery}`, sharedResponse, stdTLL); // 48 hours
		return sharedResponse;
	}
	/**
	 * Retorna a resposta do cache compartilhado entre os usuários da mesma turma
	 */
	getCourseSharedResponse(params: { event: string, sharedQuery }): ICourseDTOProps | undefined {
		const sharedQuery = JSON.stringify(params.sharedQuery);
		const sharedResponse = this.cacheService.get<ICourseDTOProps>(`${params.event}-${sharedQuery}`);
		return sharedResponse;
	}
	deleteResponses(uniqueID: string): void {
		this.cacheService.keys().forEach(key => {
			if (key.startsWith(uniqueID)) this.cacheService.del(key);
		})
	}
}

export default new ResponseCache();