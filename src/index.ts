import { Server } from "socket.io";
import { Router } from "./Router";
import LoggerService from "./services/LoggerService";

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

if(!process.env.PORT) throw new Error("PORT not found in .env file");
const PORT = parseInt(process.env.PORT) || 5000;

io.listen(PORT);
LoggerService.log("Servidor Iniciado: " + PORT);

io.on("connection", async (socket) => {
	const router = new Router(socket, io);
	await router.index();
});