import { Socket, Server } from 'socket.io';

import { Bonds } from './controllers/Bonds';
import { Courses } from './controllers/Courses';
import { session } from './controllers/Session';
import { User } from './controllers/User';

import { Auth } from "./middlewares/Auth";
export class Router {
    socket: Socket;
    io: Server;
    constructor(params: { socket: Socket, io: Server }) {
        const { socket, io } = params;
        this.io = io;
        this.socket = socket;
    }

    async index() {
        const { socket } = this;
        const user = new User();
        const auth = new Auth();
        const bonds = new Bonds();
        const courses = new Courses();
        console.log(socket.id);

        socket.use((event: any, next) => auth.middleware({ event, socket, next }))

        socket.on("user::login", async (credentials) => await user.login(credentials, { socket }));
        socket.on("user::info", async (received) => await user.info({ socket }))
        socket.on("user::logoff", async (received) => await user.logoff({ socket }));


        socket.on("bonds::list", async (received) => await bonds.list({ socket }, received));

        socket.on("courses::list", async (received) => await courses.list({ socket }, received));
        socket.on("courses::specific", async (received) => await courses.specific({ socket}, received))
        socket.on("disconnect", async (reason) => {
            session.delete(socket.id)
            console.log("Sessão finalizada")
        });
    }

}