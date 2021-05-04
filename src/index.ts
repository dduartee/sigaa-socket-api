import { Server } from "socket.io";
import eventsRoutes from "./routes";

const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const PORT = parseInt(process.env.PORT) || 5000;

io.listen(PORT)
io.on('connection', client => eventsRoutes(client))