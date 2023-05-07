import JWT from "jsonwebtoken";
import dotenv from "dotenv";

export interface TokenPayload {
	time: string,
	uniqueID: string,
	sid: string
}
dotenv.config();

class JWTService {
	secret: string;
	constructor() {
		if(!process.env.SECRET) throw new Error("SECRET not found in .env file");
		this.secret = process.env.SECRET + Date.now();
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
			// console.error(error.message);
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
			const decoded = JWT.decode(token) as TokenPayload;
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
	sign(payload: TokenPayload) {
		try {
			const token = JWT.sign(payload, this.secret);
			return token;
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}

export default new JWTService();