import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { Bonds } from "./Bonds";
import { cacheHelper } from "../helpers/Cache";
import { Courses } from "./Courses";
import { events } from "../apiConfig.json"
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { Socket } from "socket.io";
import { HomeworkDTO } from "../DTOs/Homework.DTO";
import { Activity, CourseStudent, SigaaFile, SigaaHomework } from "sigaa-api";
import { FileDTO } from "../DTOs/Attachments/File.DTO";
import { ActivityDTO } from "../DTOs/Activity.DTO";
export class Homeworks {
    constructor(private socketService: Socket) { }
    /**
     * Lista homeworks de todas as matérias de um vinculo especificado pelo registration
     * @param params 
     * @param query 
     * @returns 
     */
    async content(query: {
        inactive: boolean,
        cache: boolean,
        registration: string,
        activityTitle: string,
    }) {
        const apiEventError = events.api.error;
        try {

            const { cache, uniqueID } = cacheUtil.restore(this.socketService.id);
            const { JSESSIONID, jsonCache } = cache
            if (!JSESSIONID) {
                throw new Error("API: No JSESSIONID found in cache.");
            }
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID, cache.sigaaURL)
            const accountService = new AccountService(account)
            const activeBonds = await accountService.getActiveBonds();
            const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
            const bonds = [...activeBonds, ...inactiveBonds];
            const bond = bonds.find(b => b.registration === query.registration);
            const bondService = new BondService(bond)
            //const period = await bondService.getCurrentPeriod()
            //const active = activeBonds.includes(bond)
            const courses = await bondService.getCourses() as CourseStudent[]
            const lastActivities = (await bondService.getActivities() as Activity[]).filter(a => a.type === "homework")
            //const coursesDTOs = []
            for (const activity of lastActivities) {
                const activityJSON = new ActivityDTO(activity).toJSON()
                if (activityJSON.title !== query.activityTitle) continue;
                const course = courses.find(c => c.title === activity.courseTitle)
                const homeworks = await course.getHomeworks() as SigaaHomework[]
                const homework = homeworks.find(h => h.title === activityJSON.title)
                if (!homework) continue;
                console.log(`[homework - content] - ${homework.id}`)
                
                const attachmentFileDTO = await (homework.getAttachmentFile().then(file => new FileDTO(file as SigaaFile).toJSON()).catch(() => null))
                const fileDTO = attachmentFileDTO ?new FileDTO(attachmentFileDTO): null
                const content = await homework.getDescription()
                const haveGrade = await homework.getFlagHaveGrade()
                const isGroup = await homework.getFlagIsGroupHomework()
                const homeworkDTO = new HomeworkDTO(homework, fileDTO, content, haveGrade, isGroup)
                httpSession.close()
                return this.socketService.emit("homework::content", homeworkDTO.toJSON());
                /*
                const courseDTO = new CourseDTO(course, { homeworksDTOs: [homeworkDTO] })
                coursesDTOs.push(courseDTO)
                const bondDTO = new BondDTO(bond, active, period, { coursesDTOs })
                const bondJSON = bondDTO.toJSON()
                cacheHelper.storeCache(uniqueID, { jsonCache: [{ BondsJSON: [bondJSON], query, time: new Date().toISOString() }], time: new Date().toISOString() })
                */
            }


        } catch (error) {
            console.error(error);
            this.socketService.emit(apiEventError, error.message)
            return false;
        }
    }
}