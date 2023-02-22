import { ILessonDTOProps } from "../../DTOs/Lessons.DTO";
import CacheService from "./CacheService";

export type ILessonsCache = ILessonDTOProps[];

export default new CacheService<ILessonsCache>({ stdTTL: 5400 });