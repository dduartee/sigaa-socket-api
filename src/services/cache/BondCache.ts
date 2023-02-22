import { IBondDTOProps } from "../../DTOs/Bond.DTO";
import CacheService from "./CacheService";

export type IBondCache = IBondDTOProps;

export default new CacheService<IBondCache[]>({ stdTTL: 5400 });