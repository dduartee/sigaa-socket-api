import JWT from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 } from "uuid";
import { events } from "../apiConfig.json";
import { Event, Socket } from "socket.io";
import SessionMap from "../services/SessionMap";
import SocketReferenceMap from "../services/SocketReferenceMap";
dotenv.config();
type tokenPayload = {
	time: string,
	uniqueID: string,
}
class Auth {
	secret = process.env.SECRET;
	token: string;
	constructor(private socketService: Socket) { }
	valid(params: { token: string }) {
		const eventName = events.auth.valid;
		try {
			this.handleTokenManagement(params.token);
			return this.socketService.emit(eventName, true);
		} catch (error) {
			return this.socketService.emit(eventName, false);
		}
	}
	private handleTokenManagement(token: string) {
		const verify = token && this.verify(token);
		const decoded = verify && this.decode(token);
		if (!decoded) return false;
		const cache = SessionMap.get(decoded.uniqueID);
		if (!cache) return false;
		const sid = this.socketService.id;
		const difftime = this.diffTime(decoded.time);
		if (!(difftime < 6 && cache.JSESSIONID)) return false;
		SocketReferenceMap.delete(sid);
		SocketReferenceMap.set(sid, decoded.uniqueID);
		return true;
	}

	/**
	 * Autentica socket, verifica se tem o token e se é valido, caso não for ele enviará um valido para o client
	 * @param params 
	 * @returns 
	 */
	middleware(event: Event, next: (err?: Error) => void) {
		try {
			if (!event[1]) throw new Error("No token received");
			const { token } = event[1];
			const valid = this.handleTokenManagement(token);
			if (valid) return next();
			const uniqueID = v4();
			const sid = this.socketService.id;
			const time = new Date().toISOString();
			const newToken = this.sign({ time, uniqueID }) || "";
			SocketReferenceMap.set(sid, uniqueID);
			this.socketService.emit(events.auth.store, newToken);
			return next();
		} catch (err) {
			console.error(err);
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
			const valid = JWT.verify(token, this.secret);
			return (valid ? true : false);
		} catch (error) {
			console.error(error.message);
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
			const decoded = JWT.decode(token) as tokenPayload;
			return decoded;
		} catch (error) {
			console.error(error);
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
		const past = new Date(time);
		const now = new Date();
		const diff = Math.floor(Math.abs(past.getTime() - now.getTime()) / 36e5);
		return diff;
	}
}
export { Auth };