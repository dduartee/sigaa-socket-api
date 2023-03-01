import NodeCache from "node-cache";
import { Page, Request } from "sigaa-api";
import { SigaaRequestStack } from "sigaa-api/dist/helpers/sigaa-request-stack";

export type IRequestStackCache = SigaaRequestStack<Request, Page>;
export default new NodeCache({ stdTTL: 5400, useClones: false });