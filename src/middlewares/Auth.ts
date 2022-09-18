import JWT, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 } from 'uuid';
import { session } from '../helpers/Session';
import { cacheHelper } from '../helpers/Cache';
import { events } from "../apiConfig.json"
import { cacheService } from '../services/cacheService';
import { Socket } from "socket.io";
dotenv.config()
type tokenPayload = {
    time: string,
    uniqueID: string,
    sid: string
}
class Auth {
    secret = process.env.SECRET
    token: string;
    constructor(private socketService: Socket) { }
    valid({ token }) {
        const eventName = events.auth.valid;
        const verify = token && this.verify(token);
        const valid = verify && this.decode(token);
        if (valid) {
            const { time, uniqueID } = valid
            const hasCache = cacheHelper.getCache(uniqueID)
            const sid = this.socketService.id;
            const difftime = this.diffTime(time);
            if (difftime < 6 && hasCache?.JSESSIONID) {
                this.token = token;
                session.update(sid, uniqueID)
                this.socketService.emit(eventName, true)
                return true;
            }
        }
        this.socketService.emit(eventName, false)
        return false;
    }
    /**
     * Autentica socket, verifica se tem o token e se é valido, caso não for ele enviará um valido para o client
     * @param params 
     * @returns 
     */
    middleware(event: { 0: string, 1: { token: string } }, next: (err?: Error) => void) {
        try {
            if (!event[1]) throw new Error("No token received");
            const { token } = event[1];
            const verify = token && this.verify(token);
            const valid = verify && this.decode(token) as JwtPayload;
            if (valid) {
                const { time, uniqueID } = valid;
                const sid = this.socketService.id;
                const difftime = this.diffTime(time);
                const hasCache = cacheHelper.getCache(uniqueID)
                if (difftime < 6 && hasCache?.JSESSIONID) {
                    this.token = token;
                    cacheService.del(sid);
                    cacheService.set(sid, uniqueID);
                    const time = `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
                    console.log(`[${time} - ${token.slice(-5)} - ${this.socketService.id}] -> [${event[0]}]`) // log para identificacao
                    return next();
                }
            }
            const uniqueID = v4(); // DATABASE
            const sid = this.socketService.id; // SESSION
            const time = new Date().toISOString(); // CACHE
            const newToken = this.sign({ time, uniqueID, sid }) || "";
            this.token = newToken;
            cacheService.set(sid, uniqueID);
            cacheService.set(uniqueID, {
                time,
            });
            this.socketService.emit(events.auth.store, newToken)
            return next();
        } catch (err) {
            console.error(err)
            return false;
        }
    }
    /**
     * verifica o token JWT
     * @param token 
     * @returns 
     */
    verify(token: string) {
        try {
            const valid = JWT.verify(token, this.secret)
            return (valid ? true : false);
        } catch (error) {
            console.error(error.message)
            return false;
        }
    }
    /**
     * Decodifica o token
     * @param token 
     * @returns 
     */
    decode(token: string) {
        try {
            const decoded = JWT.decode(token) as tokenPayload
            return decoded;
        } catch (error) {
            console.error(error)
            return false;
        }
    }
    /**
     * Cria token JWT
     * @param payload 
     * @returns 
     */
    sign(payload: tokenPayload) {
        try {
            const token = JWT.sign(payload, this.secret);
            return token;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    /**
     * Calcula a diferença de tempo do token
     * @param time 
     * @returns 
     */
    diffTime(time: string) {
        const past = new Date(time)
        const now = new Date()
        const diff = Math.floor(Math.abs(past.getTime() - now.getTime()) / 36e5)
        return diff;
    }
}
export { Auth };