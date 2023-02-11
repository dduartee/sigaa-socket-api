import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { Socket } from "socket.io";
import { HomeworkDTO } from "../DTOs/Homework.DTO";
import { Activity, CourseStudent, SigaaFile, SigaaHomework } from "sigaa-api";
import { FileDTO } from "../DTOs/Attachments/File.DTO";
import { ActivityDTO } from "../DTOs/Activity.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import SocketReferenceMap from "../services/SocketReferenceMap";
import SessionMap from "../services/SessionMap";

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
        hid?: string
        activityTitle?: string,
    }) {
		const apiEventError = events.api.error;
		try {

			const uniqueID = SocketReferenceMap.get(this.socketService.id);
			const cache = SessionMap.get(uniqueID);
			const { JSESSIONID } = cache;

			const sigaaURL = new URL(cache.sigaaURL);
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);

			const accountService = new AccountService(account);
			const activeBonds = await accountService.getActiveBonds();
			const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
			const bonds = [...activeBonds, ...inactiveBonds];
			const bond = bonds.find(b => b.registration === query.registration);
			const bondService = new BondService(bond);
			//const period = await bondService.getCurrentPeriod()
			//const active = activeBonds.includes(bond)
			const courses = await bondService.getCourses() as CourseStudent[];
			const lastActivities = (await bondService.getActivities() as Activity[]).filter(a => a.type === "homework");
			//const coursesDTOs = []
			for (const activity of lastActivities) {
				const activityJSON = new ActivityDTO(activity).toJSON();
                
				if (query.activityTitle && query.activityTitle !== activityJSON.title) continue;
                
				const course = courses.find(c => c.title === activity.courseTitle);
				const homeworks = await course.getHomeworks() as SigaaHomework[];

				const homework = homeworks.find(h => h.title === activityJSON.title || (query.hid && query.hid === h.id));
				if (!homework) continue;
				console.log(`[homework - content] - ${homework.id}`);

				const attachmentFileDTO = await (homework.getAttachmentFile().then(file => new FileDTO(file as SigaaFile).toJSON()).catch(() => null));
				const fileDTO = attachmentFileDTO ? new FileDTO(attachmentFileDTO) : null;
				const content = await homework.getDescription();
				const haveGrade = await homework.getFlagHaveGrade();
				const isGroup = await homework.getFlagIsGroupHomework();
				const homeworkDTO = new HomeworkDTO(homework, fileDTO, content, haveGrade, isGroup);
				const courseDTO = new CourseDTO(course, {homeworksDTOs: [homeworkDTO]});
				sigaaInstance.close();
				return this.socketService.emit("homework::content", courseDTO.toJSON());
			}


		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}