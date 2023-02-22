import CacheService from "./CacheService";

export interface ISessionMap {
    JSESSIONID: string;
    username: string;
    sigaaURL: string;
}
export default new CacheService<ISessionMap>({ stdTTL: 5400 });