import { Lesson, LinkAttachment, SigaaCourseForum, SigaaFile, SigaaHomework, SigaaQuiz, SigaaSurvey, SigaaWebContent, StudentBond, VideoAttachment } from "sigaa-api";
import { HyperlinkAttachment } from "sigaa-api/dist/courses/resources/attachments/sigaa-hyperlink-student";
import { Socket } from "socket.io";
import { AttachmentDTO } from "../DTOs/Attachments/Attachment.DTO";
import { FileDTO } from "../DTOs/Attachments/File.DTO";
import { ForumDTO } from "../DTOs/Attachments/Forum.DTO";
import { HyperLinkDTO } from "../DTOs/Attachments/Hyperlink.DTO";
import { LinkDTO } from "../DTOs/Attachments/Link.DTO";
import { QuizDTO } from "../DTOs/Attachments/Quiz.DTO";
import { SurveyDTO } from "../DTOs/Attachments/Survey.DTO";
import { VideoDTO } from "../DTOs/Attachments/Video.DTO";
import { WebContentDTO } from "../DTOs/Attachments/WebContent.DTO";
import { BondDTO } from "../DTOs/Bond.DTO";
import { CourseDTO } from "../DTOs/CourseDTO";
import { HomeworkDTO } from "../DTOs/Homework.DTO";
import { LessonDTO } from "../DTOs/Lessons.DTO";
import { cacheHelper } from "../helpers/Cache";
import { cacheService } from "../services/cacheService";
import { CacheType, cacheUtil } from "../services/cacheUtil";
import { AccountService } from "../services/sigaa-api/Account.service";
import { BondService } from "../services/sigaa-api/Bond.service";
import { CourseService } from "../services/sigaa-api/Course.service";
import AuthenticationService from "../services/sigaa-api/Authentication.service";


export class Lessons {
	constructor(private socketService: Socket) { }
	async list(query: {
        inactive: boolean;
        cache: boolean,
        registration: string,
        courseId: string,
        allPeriods: boolean
    }) {
		try {
			const uniqueID = cacheService.get<string>(this.socketService.id);
			const cache = cacheService.get<CacheType>(uniqueID);
			const { JSESSIONID } = cache;
			if (query.cache) {
				const newest = cacheHelper.getNewest(cache.jsonCache, query);
				if (newest) {
					const bond = newest["BondsJSON"].find(bond => bond.registration === query.registration);
					const course = bond.courses.find(course => course.id === query.courseId);
					return this.socketService.emit("lessons::list", course);
				}
			}

			const sigaaURL = new URL(cache.sigaaURL);
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);

			const accountService = new AccountService(account);
			const activeBonds = await accountService.getActiveBonds();
			const inactiveBonds = query.inactive ? await accountService.getInactiveBonds() : [];
			const bonds = [...activeBonds, ...inactiveBonds];
			const bond = bonds.find(b => b.registration === query.registration) as StudentBond | undefined;
			if (!bond) throw new Error(`Bond not found with registration ${query.registration}`);
			const bondService = new BondService(bond);
			const period = await bondService.getCurrentPeriod();
			const active = bonds.includes(bond);
			const courses = await bondService.getCourses(query.allPeriods);
			let courseDTO: CourseDTO;
			for (const course of courses) {
				if (course.id !== query.courseId) continue;
				const courseService = new CourseService(course);
				const lessons = await courseService.getLessons();
				const lessonsDTOs: LessonDTO[] = [];
				for (const lesson of lessons) {
					const attachmentsDTOs = await this.getAttachmentsDTOs(lesson);
					const lessonDTO = new LessonDTO(lesson, attachmentsDTOs);
					lessonsDTOs.push(lessonDTO);
				}
				courseDTO = new CourseDTO(course, { lessonsDTOs });
			}
			const bondDTO = new BondDTO(bond, active, period, { coursesDTOs: [courseDTO] });
			const bondJSON = bondDTO.toJSON();
			cacheUtil.merge(uniqueID, {
				jsonCache: [
					{ BondsJSON: [bondJSON], query, time: new Date().toISOString() },
				],
				time: new Date().toISOString(),
			});
			sigaaInstance.close();
			return this.socketService.emit("lessons::list", courseDTO.toJSON());
		} catch (error) {
			console.error(error);
			this.socketService.emit("api::error", error.message);
			return false;
		}
	}
	private async getAttachmentsDTOs(lesson: Lesson) {
		const attachmentsDTOs: AttachmentDTO[] = [];
		for (const attachment of lesson.attachments) {
			switch (attachment.type) {
			case "file": {
				const file = attachment as SigaaFile;
				const fileDTO = new FileDTO(file);
				const attachmentDTO = new AttachmentDTO(fileDTO, "file");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			case "link": {
				const linkAttachment = attachment as LinkAttachment;
				const linkDTO = new LinkDTO(linkAttachment);
				const attachmentDTO = new AttachmentDTO(linkDTO, "link");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			case "hyperlink": {
				const hyperlinkAttachment = attachment as HyperlinkAttachment;
				const hyperlinkDTO = new HyperLinkDTO(hyperlinkAttachment);
				const attachmentDTO = new AttachmentDTO(hyperlinkDTO, "hyperlink");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			case "video": {
				const videoAttachment = attachment as VideoAttachment;
				const videoDTO = new VideoDTO(videoAttachment);
				const attachmentDTO = new AttachmentDTO(videoDTO, "video");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			case "forum": {
				const forumAttachment = attachment as SigaaCourseForum;
				const author = await forumAttachment.getAuthor();
				const creationDate = await forumAttachment.getCreationDate();
				const numOfTopics = await forumAttachment.getNumOfTopics();
				const flagMonitorReading = await forumAttachment.getFlagMonitorReading();
				const file = await forumAttachment.getFile();
				const fileDTO = file ? new FileDTO(file as SigaaFile) : null;
				const forumType = await forumAttachment.getForumType();
				const description = await forumAttachment.getDescription();
				const forumDTO = new ForumDTO(forumAttachment, description, author, forumType, creationDate, numOfTopics, flagMonitorReading, fileDTO);
				const attachmentDTO = new AttachmentDTO(forumDTO, "forum");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			case "quiz": {
				const quizAttachment = attachment as SigaaQuiz;
				const quizDTO = new QuizDTO(quizAttachment);
				const attachmentDTO = new AttachmentDTO(quizDTO, "quiz");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			case "homework": {
				const homework = attachment as SigaaHomework;
				const attachmentFileDTO = await (homework.getAttachmentFile().then(file => new FileDTO(file as SigaaFile).toJSON()).catch(() => null));
				const fileDTO = attachmentFileDTO ? new FileDTO(attachmentFileDTO) : null;
				const content = await homework.getDescription();
				const haveGrade = await homework.getFlagHaveGrade();
				const isGroup = await homework.getFlagIsGroupHomework();
				const homeworkDTO = new HomeworkDTO(homework, fileDTO, content, haveGrade, isGroup);
				const attachmentDTO = new AttachmentDTO(homeworkDTO, "homework");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			case "webcontent": {
				const webContent = attachment as SigaaWebContent;
				const content = await webContent.getContent();
				const date = await webContent.getDate();
				const webContentDTO = new WebContentDTO(webContent, content, date);

				const attachmentDTO = new AttachmentDTO(webContentDTO, "webcontent");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			case "survey": {
				const surveyAttachment = attachment as SigaaSurvey;
				const surveyDTO = new SurveyDTO(surveyAttachment);
				const attachmentDTO = new AttachmentDTO(surveyDTO, "survey");
				attachmentsDTOs.push(attachmentDTO);
				break;
			}
			default:
				break;
			}
		}
		return attachmentsDTOs;
	}
}
