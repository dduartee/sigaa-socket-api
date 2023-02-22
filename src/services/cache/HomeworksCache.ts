import { IHomeworkDTOProps } from "../../DTOs/Homework.DTO";
import CacheService from "./CacheService";

export type IHomeworkCache = IHomeworkDTOProps;

export default new CacheService<IHomeworkCache>({ stdTTL: 5400 });