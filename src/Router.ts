
import { Bonds } from "./controllers/Bonds";
import { Courses } from "./controllers/Courses";
import { Grades } from "./controllers/Grades";
import { Homeworks } from "./controllers/Homeworks";
import { LoginCredentials, User } from "./controllers/User";

import { Auth } from "./middlewares/Auth";
import { Activities } from "./controllers/Activities";
import { Server, Socket } from "socket.io";
import { Absences } from "./controllers/Absences";
import { Lessons } from "./controllers/Lessons";
import SessionMap, { ISessionMap } from "./services/cache/SessionCache";
import SocketReferenceMap from "./services/cache/SocketReferenceCache";
export class Router {
	constructor(private socketService: Socket, private io: Server) { }

	async index() {
		// this.socketService.onAny(console.debug);
		/**
	 * Inicializações das classes dos eventos
	 */
		const user = new User(this.socketService);
		const auth = new Auth(this.socketService);
		const bonds = new Bonds(this.socketService);
		const courses = new Courses(this.socketService);
		const homework = new Homeworks(this.socketService);
		const grades = new Grades(this.socketService);
		const activities = new Activities(this.socketService);
		const absences = new Absences(this.socketService);
		const lessons = new Lessons(this.socketService);
		this.socketService.use((event, next) => auth.middleware(event, next));
		this.socketService.on("auth::valid", async (query) => auth.valid(query));

		this.socketService.use((event, next) => {
			const events = ["auth::valid", "user::login"];
			const eventName = event[0];
			if (events.includes(eventName)) return next();
			else {
				const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
				const cache = SessionMap.get<ISessionMap>(uniqueID);
				if (!cache) return this.socketService.emit("api::error", "API: No cache found.");
				if (!cache.JSESSIONID) return this.socketService.emit("api::error", "API: No JSESSIONID found in cache.");
				return next();
			}
		});
		this.socketService.on("user::login", async (credentials: LoginCredentials) => await user.login(credentials));
		this.socketService.on("user::info", async () => await user.info());
		this.socketService.on("user::logoff", async () => await user.logoff());

		this.socketService.on("bonds::list", async (query) => await bonds.list(query));

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

		this.socketService.on("disconnect", async () => {
			SocketReferenceMap.del(this.socketService.id);
		});
	}
}
