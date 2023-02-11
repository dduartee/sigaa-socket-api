import merge from "ts-deepmerge";
import { IStudentDTOProps } from "../DTOs/Student.DTO";
class StudentMap<K,T> extends Map<K, T> {
	constructor() {
		super();
	}
	merge(key: K, value: Partial<T>) {
		const cached = this.get(key) ?? {};
		const merged = merge(cached, value) as T;
		this.set(key, merged);
		return merged;
	}
}
export default new StudentMap<string, IStudentDTOProps>();