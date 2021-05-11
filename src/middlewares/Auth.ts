import { Socket } from 'socket.io';
import JWT from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 } from 'uuid';
import { session } from '../controllers/Session';
export interface IAuth {
    secret: string;
    token: string;
    middleware(params: { event: { 0: string, 1: { username: string, password: string, token: string } }, socket: Socket, next: (err?: Error) => void }): void
    verify(token: string): boolean
    decode(token: string): any
    diffTime(time: string): number
}
class Auth implements IAuth {
    secret: string;
    token: string;
    constructor(secret?: string) {
        dotenv.config()
        this.secret = process.env.SECRET || secret;
    }
    middleware(params: { event: { 0: string, 1: { token: string } }, socket: Socket, next: (err?: Error) => void }) {
        try {
            const { event, socket, next } = params;
            if (!event[1]) throw new Error("No token received");
            const { token } = event[1];
            const valid = token && this.verify(token) && this.decode(token);
            if (valid) {
                const { time, uniqueID } = valid;
                const sid = socket.id;
                const difftime = this.diffTime(time);
                if (difftime < 6) {
                    this.token = token;
                    session.update(sid, uniqueID)
                    return next();
                }
            }
            const uniqueID = v4(); // DATABASE
            const sid = socket.id; // SESSION
            const time = new Date().toISOString(); // CACHE
            const newToken: any = this.sign({ time, uniqueID, sid })
            this.token = newToken;
            session.create(sid, uniqueID)
            socket.emit('auth::store', newToken)
            return next();
        } catch (err) {
            console.error(err)
            return false;
        }
    }
    verify(token: string) {
        try {
            const valid = JWT.verify(token, this.secret)
            return (valid ? true : false);
        } catch (error) {
            console.error(error)
            return false;
        }
    }
    decode(token: string) {
        try {
            const decoded: any = JWT.decode(token);
            return decoded;
        } catch (error) {
            console.error(error)
            return false;
        }
    }
    sign(payload: {}) {
        try {
            const token = JWT.sign(payload, this.secret);
            return token;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    diffTime(time: string) {
        const past = new Date(time)
        const now = new Date()
        const diff = Math.floor(Math.abs(past.getTime() - now.getTime()) / 36e5)
        return diff;
    }
}
export { Auth };