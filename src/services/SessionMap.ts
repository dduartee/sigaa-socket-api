
export interface ISessionMap {
    JSESSIONID: string;
    username: string;
    sigaaURL: string;
}
export default new Map<string, ISessionMap>();