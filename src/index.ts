import { Server } from "socket.io";
import { Router } from "./Router";

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

const PORT = parseInt(process.env.PORT) || 5000;

io.listen(PORT);
console.log("Servidor Iniciado: " + PORT);

io.on("connection", async (socket) => {
	const router = new Router(socket, io);
	await router.index();
});