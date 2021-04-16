import { Server } from "socket.io";
import eventsRoutes from "./events/routes";
import socketCache from "./models/socketCache";
import { v4 } from "uuid";
import JWTController from "./controllers/JWTController";
const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
const PORT = parseInt(process.env.PORT) || 5000;
const jwt = new JWTController(v4())
const cache = new socketCache({
    useClones: false,
    stdTTL: 7200
});
io.listen(PORT)
io.on('connection', client => eventsRoutes(client, jwt, cache))