import { Server } from "socket.io";
import { Router } from "./Router";


const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
const PORT = parseInt(process.env.PORT) || 5000;
io.listen(PORT)
io.on('connection', async (socket) => await new Router({socket, io}).index())