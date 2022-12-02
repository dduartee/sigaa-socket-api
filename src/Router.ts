
import { Bonds } from "./controllers/Bonds";
import { Courses } from "./controllers/Courses";
import { Grades } from "./controllers/Grades";
import { Homeworks } from "./controllers/Homeworks";
import { News } from "./controllers/News";
import { session } from "./helpers/Session";
import { User } from "./controllers/User";

import { Auth } from "./middlewares/Auth";
import { Activities } from "./controllers/Activities";
import { cacheService } from "./services/cacheService";
import { Server, Socket } from "socket.io";
import { Absences } from "./controllers/Absences";
import { Lessons } from "./controllers/Lessons";
export class Router {
  constructor(private socketService: Socket, private io: Server) { }

  async index() {
    const connectedUsers = cacheService.get<string[]>("connectedUsers");
    if (!connectedUsers) {
      cacheService.set("connectedUsers", []);
      cacheService.set("maxConnectedUsers", 0);
    } else if (!connectedUsers.includes(this.socketService.id)) {
      connectedUsers.push(this.socketService.id);
      cacheService.set("connectedUsers", connectedUsers);
      const maxConnectedUsers = cacheService.get<number>("maxConnectedUsers");
      if (connectedUsers.length > maxConnectedUsers) {
        cacheService.set("maxConnectedUsers", connectedUsers.length);
        console.log("Max connected users: ", connectedUsers.length);
      } else {
        console.log("Max connected users: ", maxConnectedUsers);
      }
      console.log("Connected users: ", connectedUsers.length);
    }
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
      const connectedUsers = cacheService.get<string[]>("connectedUsers");
      connectedUsers.splice(connectedUsers.indexOf(this.socketService.id), 1); // Remove o usuário da lista de usuários conectados
      cacheService.set("connectedUsers", connectedUsers);
      console.log("Connected users: ", connectedUsers.length);
    });
  }
}
