import { Server } from "socket.io";
import { Router } from "./Router";
import packageJSON from "../package.json";

const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const PORT = parseInt(process.env.PORT) || 5000;

io.listen(PORT)
console.log("Servidor Iniciado: " + PORT)
console.log("Versão: " + packageJSON.version)

io.on('connection', async (socket) => await new Router({ socket, io }).index())