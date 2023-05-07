import { Syllabus } from "sigaa-api";

export interface SyllabusDay {
    description: string;
    startDate?: string;
    endDate?: string;
}

export interface SyllabusReference {
    type?: string;
    description: string;
}
export interface Exam {
    description: string;
    date?: string;
}
export interface ISyllabusDTOProps {
    methods: string;
    assessmentProcedures: string;
    attendanceSchedule: string;
    schedule: SyllabusDay[];
    exams: Exam[];
    references: {
        basic: SyllabusReference[];
        supplementary: SyllabusReference[];
    }
}
export interface ISyllabusDTO {
    toJSON(): ISyllabusDTOProps;
}
export class SyllabusDTO implements ISyllabusDTO {
	constructor(public syllabus: Syllabus) { }

	toJSON(): ISyllabusDTOProps {
		return {
			references: {
				basic: this.syllabus.basicReferences,
				supplementary: this.syllabus.supplementaryReferences,
			},
			methods: this.syllabus.methods || "",
			schedule: this.syllabus.schedule.map(schedule => ({
				description: schedule.description,
				endDate: schedule.endDate?.toISOString(),
				startDate: schedule.startDate?.toISOString()
			})),
			exams: this.syllabus.evaluations.map(exam => ({
				description: exam.description,
				date: exam.date?.toISOString()
			})),
			assessmentProcedures: this.syllabus.assessmentProcedures || "",
			attendanceSchedule: this.syllabus.attendanceSchedule || "",
		};
	}

}