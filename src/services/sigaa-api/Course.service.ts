import { CourseStudent, File, News, NewsData, SigaaFile, SigaaHomework, SigaaNews, StudentBond } from "sigaa-api";
import { FullHomework } from "../../DTOs/Homework.DTO";
import { FullNews } from "../../DTOs/News.DTO";
export class CourseService {
    constructor(private course: CourseStudent) { }
    async getHomeworks(full = false, retryTimes = 0) {
        try {
            const homeworks = await this.course.getHomeworks() as SigaaHomework[]
            const homeworksParsed: FullHomework[] = []
            for (const homework of homeworks) {
                let content: string
                let haveGrade: boolean
                let isGroup: boolean
                if (full) {
                    content = await homework.getDescription();
                    haveGrade = await homework.getFlagHaveGrade();
                    isGroup = await homework.getFlagIsGroupHomework();
                }
                homeworksParsed.push({
                    id: homework.id,
                    title: homework.title,
                    content: content,
                    startDate: homework.startDate,
                    endDate: homework.endDate,
                    haveGrade: haveGrade,
                    isGroup
                })
            }
            return homeworksParsed;
        } catch (error) {
            console.log(`Error: ${error} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getHomeworks(full, retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getGrades(retryTimes = 0) {
        try {
            const grades = await this.course.getGrades();
            return grades;
        } catch (error) {
            console.log(`Error: ${error} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getGrades(retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getNews(retryTimes = 0): Promise<SigaaNews[]> {
        try {
            const news = await this.course.getNews() as SigaaNews[]
            return news
        } catch (error) {
            console.log(`Error: ${error} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getNews(retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getFullNews(news: SigaaNews[], retryTimes = 0): Promise<FullNews[]> {
        try {
            const newsParsed: FullNews[] = []
            for (const n of news) {
                const content = await n.getContent();
                const date = await n.getDate();
                newsParsed.push({
                    id: n.id,
                    title: n.title,
                    content,
                    date,
                })
            }
        } catch (error) {
            console.log(`Error: ${error} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getFullNews(news, retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getLessons(retryTimes = 0) {
        try {
            const lessons = await this.course.getLessons();
            return lessons;
        } catch (error) {
            console.log(`Error: ${error} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getLessons(retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getAbsence(retryTimes = 0) {
        try {
            const absence = await this.course.getAbsence();
            return absence;
        } catch (error) {
            console.log(`Error: ${error} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getAbsence(retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getMembers(retryTimes = 0) {
        try {
            const members = await this.course.getMembers();
            return members;
        } catch (error) {
            console.log(`Error: ${error} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getMembers(retryTimes + 1);
            } else {
                return [];
            }
        }
    }
    async getSyllabus(retryTimes = 0) {
        try {
            const syllabus = await this.course.getSyllabus();
            return syllabus;
        } catch (error) {
            console.log(`Error: ${error} @ ${retryTimes}/3`);
            if (retryTimes < 3) {
                return this.getSyllabus(retryTimes + 1);
            } else {
                return [];
            }
        }
    }

};
