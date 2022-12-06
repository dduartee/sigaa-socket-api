
import { Bonds } from "./controllers/Bonds";
import { Courses } from "./controllers/Courses";
import { Grades } from "./controllers/Grades";
import { Homeworks } from "./controllers/Homeworks";
import { News } from "./controllers/News";
import { session } from "./helpers/Session";
import { User } from "./controllers/User";

import { Auth } from "./middlewares/Auth";
import { Activities } from "./controllers/Activities";
import { Server, Socket } from "socket.io";
import { Absences } from "./controllers/Absences";
import { Lessons } from "./controllers/Lessons";
export class Router {
	constructor(private socketService: Socket, private io: Server) { }

	async index() {
		/**
     * Inicializações das classes dos eventos
     */
		const user = new User(this.socketService);
		const auth = new Auth(this.socketService);
		const bonds = new Bonds(this.socketService);
		const courses = new Courses(this.socketService);
		const homework = new Homeworks(this.socketService);
		const news = new News(this.socketService);
		const grades = new Grades(this.socketService);
		const activities = new Activities(this.socketService);
		const absences = new Absences(this.socketService);
		const lessons = new Lessons(this.socketService);
		this.socketService.use((event: any, next) => auth.middleware(event, next));

		this.socketService.on("auth::valid", async (query) => auth.valid(query));

		this.socketService.on(
			"user::login",
			async (credentials) => await user.login(credentials)
		);
		this.socketService.on("user::info", async (query) => await user.info());
		this.socketService.on(
			"user::logoff",
			async (query) => await user.logoff()
		);

		this.socketService.on(
			"bonds::list",
			async (query) => await bonds.list(query)
		);

		this.socketService.on(
			"courses::list",
			async (query) => await courses.list(query)
		);

		this.socketService.on(
			"homework::content",
			async (query) => await homework.content(query)
		);

		this.socketService.on(
			"activities::list",
			async (query) => await activities.list(query)
		);

		this.socketService.on(
			"news::latest",
			async (query) => await news.latest(query)
		);

		this.socketService.on(
			"grades::list",
			async (query) => await grades.list(query)
		);

		this.socketService.on(
			"absences::list",
			async (query) => await absences.list(query)
		);

		this.socketService.on(
			"lessons::list",
			async (query) => await lessons.list(query)
		);

		this.socketService.on("disconnect", async (reason) => {
			session.delete(this.socketService.id);
		});
	}
}
