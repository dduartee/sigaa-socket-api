import {
	CourseStudentData,
	Sigaa,
	SigaaCourseFactory,
	SigaaCourseResourceManagerFactory,
	SigaaCourseResourcesFactory,
	SigaaCourseStudent,
	SigaaLessonParserFactory,
} from "sigaa-api";
  
class RehydrateCourseFactory {
      
	create(
		courseData: CourseStudentData,
		sigaaInstance: Sigaa
	): SigaaCourseStudent {
		const { httpFactory, parser } = sigaaInstance;
		const http = httpFactory.createHttp();
		const courseResourcesFactory = new SigaaCourseResourcesFactory(parser);
		const courseResourcesManagerFactory = new SigaaCourseResourceManagerFactory(
			courseResourcesFactory
		);
		const lessonParserFactory = new SigaaLessonParserFactory(parser);
		const courseFactory = new SigaaCourseFactory(
			http,
			parser,
			courseResourcesManagerFactory,
			lessonParserFactory
		);
		return courseFactory.createCourseStudent(courseData);
	}
}
  
export default new RehydrateCourseFactory();
  