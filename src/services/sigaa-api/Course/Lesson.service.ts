import { HyperlinkAttachment, Lesson, LessonData, LinkAttachment, SigaaCourseForum, SigaaFile, SigaaHomework, SigaaQuiz, SigaaSurvey, SigaaWebContent, VideoAttachment } from "sigaa-api";
import { AttachmentDTO } from "../../../DTOs/Attachments/Attachment.DTO";
import { FileDTO } from "../../../DTOs/Attachments/File.DTO";
import { ForumDTO } from "../../../DTOs/Attachments/Forum.DTO";
import { HyperLinkDTO } from "../../../DTOs/Attachments/Hyperlink.DTO";
import { LinkDTO } from "../../../DTOs/Attachments/Link.DTO";
import { QuizDTO } from "../../../DTOs/Attachments/Quiz.DTO";
import { SurveyDTO } from "../../../DTOs/Attachments/Survey.DTO";
import { VideoDTO } from "../../../DTOs/Attachments/Video.DTO";
import { WebContentDTO } from "../../../DTOs/Attachments/WebContent.DTO";
import { HomeworkDTO } from "../../../DTOs/Homework.DTO";
import { LessonDTO } from "../../../DTOs/Lessons.DTO";

class LessonService {
	constructor(private lesson: Lesson) { }
	async getDTO() {
		const attachmentsDTOs = await this.getAttachmentsDTOs();
		const lessonDTO = new LessonDTO(this.lesson, attachmentsDTOs);
		return lessonDTO;
	}
	private async getAttachmentsDTOs() {
		const attachmentsDTOs: AttachmentDTO[] = [];
		for (const attachment of this.lesson.attachments) {
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

export { LessonService };