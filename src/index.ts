import { Server } from "socket.io";
import { Router } from "./Router";
import { cacheService } from "./services/cacheService";

const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const PORT = parseInt(process.env.PORT) || 5000;

io.listen(PORT)
console.log("SERVIDOR INICIADO: " + PORT)

io.on('connection', async (socket) => await new Router({ socket, io }).index())