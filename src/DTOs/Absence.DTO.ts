import { AbsenceList } from "sigaa-api";

export interface IAbsenceDTOProps {
    list: {
        date: Date;
        numOfAbsences: number;
    }[]
    totalAbsences: number;
    maxAbsences: number;
}

export interface IAbsenceDTO {
    toJSON(): IAbsenceDTOProps;
}

export class AbsenceDTO implements IAbsenceDTO {
    constructor(public absence: AbsenceList) { }

    toJSON(): IAbsenceDTOProps {
        return {
            list: this.absence.list.map((absence) => ({
                date: absence.date,
                numOfAbsences: absence.numOfAbsences
            })),
            totalAbsences: this.absence.totalAbsences,
            maxAbsences: this.absence.maxAbsences
        }
    }
}