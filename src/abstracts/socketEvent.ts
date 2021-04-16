import { StudentBond } from "sigaa-api";
import { Socket } from "socket.io";
import socketCache from "../models/socketCache";
interface IsocketEvent{
    list(client: Socket, cache: socketCache) : any
}
export {IsocketEvent}