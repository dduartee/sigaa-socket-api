import { ISumOfGradesDTOProps, SumOfGradesDTO } from "./SumOfGrades.DTO"
import { IWeightedAverageDTOProps, WeightedAverageDTO } from "./WeightedAverage.DTO"

export type ISubGradeDTOProps = ISumOfGradesDTOProps | IWeightedAverageDTOProps
export type SubGradeDTO = SumOfGradesDTO | WeightedAverageDTO