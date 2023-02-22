import { StudentData } from "../../DTOs/Student.DTO";
import CacheService from "./CacheService";

export interface IStudentCache {
    info: StudentData;
}

export default new CacheService<IStudentCache>({ stdTTL: 5400 });