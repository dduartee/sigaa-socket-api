import { Sigaa } from "sigaa-api";
import { IBondDTOProps } from "../DTOs/Bond.DTO";
import LoggerService from "../services/LoggerService";
import { BondService } from "../services/sigaa-api/Bond/Bond.service";
import { CourseService } from "../services/sigaa-api/Course/Course.service";
import { ICourseDTOProps } from "../DTOs/CourseDTO";


/**
 * Classe abstrata que contém métodos comuns entre os controllers de dentro de uma matéria
 */
export abstract class CourseCommonController {
	/**
     * Retorna um objeto com os dados que serão usados para identificar a resposta compartilhada
     */
	protected getSharedQuery(course: ICourseDTOProps, additionalQuery = {}) {
		return { courseId: course.id, period: course.period, ...additionalQuery };
	}

	protected async getCourseService(bond: IBondDTOProps, courseId: string, sigaaInstance: Sigaa): Promise<CourseService | undefined> {
		const bondCourses = bond.courses || [];
		if (bondCourses.length > 0) {
			const course = bondCourses.find((course) => course.id === courseId);
			if (!course) return undefined;
			return CourseService.fromDTO(course, sigaaInstance);
		} else {
			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const courses = await bondService.getCourses();
			LoggerService.log(`[getCourseService] - ${courses.length} (fetched)`);
			const course = courses.find(course => course.id === courseId);
			if (!course) return undefined;
			return  new CourseService(course);
		}
	}
	protected async getCoursesServices(bond: IBondDTOProps, sigaaInstance: Sigaa) {
		const courses = bond.courses || [];
		if (courses.length > 0) {
			const coursesServices = courses.map(course => CourseService.fromDTO(course, sigaaInstance));
			return coursesServices;
		} else {
			const bondService = BondService.fromDTO(bond, sigaaInstance);
			const courses = await bondService.getCourses();
			const coursesServices = courses.map(course => new CourseService(course));
			LoggerService.log(`[getCoursesServices] - ${courses.length} (fetched)`);
			return coursesServices;
		}
	}
}