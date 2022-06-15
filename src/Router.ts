import { Socket, Server } from "socket.io";

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
export class Router {
  socket: Socket;
  io: Server;
  constructor(params: { socket: Socket; io: Server }) {
    const { socket, io } = params;
    this.io = io;
    this.socket = socket;
  }

  async index() {
    const { socket } = this;
    const connectedUsers = cacheService.get<string[]>("connectedUsers");
    if(!connectedUsers) {
      cacheService.set("connectedUsers", []);
    } else if (!connectedUsers.includes(socket.id)) {
      connectedUsers.push(socket.id);
      cacheService.set("connectedUsers", connectedUsers);
      console.log("Connected users: ", connectedUsers.length);
    }
    /**
     * Inicializações das classes dos eventos
     */
    const user = new User();
    const auth = new Auth();
    const bonds = new Bonds();
    const courses = new Courses();
    const homework = new Homeworks();
    const news = new News();
    const grades = new Grades();
    const activities = new Activities();

    socket.use((event: any, next) => auth.middleware({ event, socket, next }));

    socket.on("auth::valid", async (received) => auth.valid(socket, received));

    socket.on(
      "user::login",
      async (credentials) => await user.login(credentials, { socket })
    );
    socket.on("user::info", async (received) => await user.info({ socket }));
    socket.on(
      "user::logoff",
      async (received) => await user.logoff({ socket })
    );

    socket.on(
      "bonds::list",
      async (received) => await bonds.list({ socket }, received)
    );

    socket.on(
      "courses::list",
      async (received) => await courses.list({ socket }, received)
    );
    socket.on(
      "courses::details",
      async (received) => await courses.details({ socket }, received)
    );

    socket.on(
      "homeworks::specific",
      async (received) => await homework.specific({ socket }, received)
    );
    socket.on(
      "homeworks::list",
      async (received) => await homework.list({ socket }, received)
    );

    socket.on(
      "activities::list",
      async (received) => await activities.list({ socket }, received)
    );

    socket.on(
      "news::list",
      async (received) => await news.list({ socket }, received)
    );

    socket.on(
      "grades::list",
      async (received) => await grades.list({ socket }, received)
    );

    socket.on("disconnect", async (reason) => {
      session.delete(socket.id);
      const connectedUsers = cacheService.get<string[]>("connectedUsers");
      connectedUsers.splice(connectedUsers.indexOf(socket.id), 1); // Remove o usuário da lista de usuários conectados
      cacheService.set("connectedUsers", connectedUsers);
      console.log("Sessão finalizada");
      console.log("Connected users: ", connectedUsers.length);
    });
  }
}
