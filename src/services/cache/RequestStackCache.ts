import { Page, Request } from "sigaa-api";
import { SigaaRequestStack } from "sigaa-api/dist/helpers/sigaa-request-stack";
import CacheService from "./CacheService";

export type IRequestStackCache = SigaaRequestStack<Request, Page>;
export default new CacheService<IRequestStackCache>({ stdTTL: 5400, useClones: false });