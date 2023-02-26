import { v4 } from "uuid";
import { events } from "../apiConfig.json";
import { Event, Socket } from "socket.io";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import jwt from "../services/JWTService";
class Auth {
	token: string;
	constructor(private socketService: Socket) { }
	valid(params: { token: string }) {
		const eventName = events.auth.valid;
		const valid = this.handleTokenManagement(params.token);
		return this.socketService.emit(eventName, valid);
	}
	private handleTokenManagement(token: string) {
		const verify = token && jwt.verify(token);
		const decoded = verify && jwt.decode(token);
		if (!decoded) return false;
		const cache = SessionMap.get<ISessionMap>(decoded.uniqueID);
		if (!cache) return false;
		const sid = this.socketService.id; 
		const difftime = this.diffTime(decoded.time);
		if (!(difftime < 6 && cache.JSESSIONID)) return false;
		SocketReferenceMap.del(decoded.sid);
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
			const newToken = jwt.sign({ time, uniqueID, sid }) || "";
			SocketReferenceMap.set(sid, uniqueID);
			this.socketService.emit(events.auth.store, newToken);
			return next();
		} catch (err) {
			console.error(err);
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