import {
	HTTP,
	HTTPFactory,
	Parser,
	Sigaa,
	SigaaActivityFactory,
	SigaaBondFactory,
	SigaaCourseFactory,
	SigaaCourseResourceManagerFactory,
	SigaaCourseResourcesFactory,
	SigaaLessonParserFactory,
	StudentBond,
} from "sigaa-api";

class BondRehydrateFactory {
	create(
		bondData: {
      program: string;
      registration: string;
      sequence: number;
    }, sigaaInstance:Sigaa): StudentBond {
		const { program, registration, sequence } = bondData;
		const { httpFactory, parser } = sigaaInstance;
		const http = httpFactory.createHttp();
		const bondSwitchUrl = new URL(
			`https://sigaa.ifsc.edu.br/sigaa/escolhaVinculo.do?dispatch=escolher&vinculo=${sequence}`
		);
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
		const activityFactory = new SigaaActivityFactory();
		const bondFactory = new SigaaBondFactory(
			httpFactory,
			parser,
			courseFactory,
			activityFactory
		);
		const bond = bondFactory.createStudentBond(
			registration,
			program,
			bondSwitchUrl
		);
		return bond;
	}
}

export default new BondRehydrateFactory();