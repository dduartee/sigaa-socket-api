import NodeCache from "node-cache";

export interface ISessionMap {
    JSESSIONID: string;
    username: string;
    sigaaURL: string;
}
export default new NodeCache({ stdTTL: 5400 });