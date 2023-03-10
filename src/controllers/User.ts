import { sigaaIfscURL } from "../apiConfig.json";
import { Page, Request, Sigaa } from "sigaa-api";
import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { Socket } from "socket.io";
import { IStudentDTOProps, StudentDTO } from "../DTOs/Student.DTO";
import { SigaaRequestStack } from "sigaa-api/dist/helpers/sigaa-request-stack";
import SessionMap, { ISessionMap } from "../services/cache/SessionCache";
import SocketReferenceMap from "../services/cache/SocketReferenceCache";
import RequestStackCache from "../services/cache/RequestStackCache";
import ResponseCache from "../services/cache/ResponseCache";
import BondCache from "../services/cache/BondCache";

export type LoginCredentials = {
	username: string;
	password: string;
	sigaaURL: string;
}
export class User {
	logado: boolean;
	constructor(private socketService: Socket) { }
	/**
	 * Realiza evento de login
	 * @param credentials 
	 * @returns 
	 */
	async login(credentials: LoginCredentials) {
		const sigaaURL = credentials.sigaaURL || sigaaIfscURL;
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			// login com credenciais
			if (credentials.username && credentials.password) {
				console.log(`[${credentials.username} - ${this.socketService.id}] logando (senha)`);
				this.socketService.emit("user::status", "Logando");
				const requestStackController = new SigaaRequestStack<Request, Page>();
				const sigaaInstance = new Sigaa({ url: sigaaURL, requestStackController });
				const { JSESSIONID } = await AuthenticationService.loginWithCredentials(credentials, sigaaInstance);
				RequestStackCache.set(JSESSIONID, requestStackController);
				console.log(`[${credentials.username} - ${this.socketService.id}] Logado (senha) com sucesso`);
				SessionMap.set(uniqueID, { JSESSIONID, username: credentials.username, sigaaURL: sigaaURL });
				sigaaInstance.close();
				this.socketService.emit("user::status", "Logado");
				return this.socketService.emit("user::login", { logado: true });
			} else {
				// login com o JSESSIONID
				if (!SessionMap.has(uniqueID)) {
					this.socketService.emit("user::status", "Deslogado");
					return this.socketService.emit("user::login", { logado: false });
				} else {
					const { JSESSIONID, username } = SessionMap.get<ISessionMap>(uniqueID);
					if (credentials.username !== username) throw new Error("API: Username in cache does not match the username in the request.");
					if (!JSESSIONID) throw new Error("API: No JSESSIONID found in cache.");
					console.log(`[${credentials.username} - ${this.socketService.id}] logando (sessão)`);
					this.socketService.emit("user::status", "Logando");
					const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
					await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
					console.log(`[${username} - ${this.socketService.id}] Logado (sessão) com sucesso`);
					sigaaInstance.close();
					this.socketService.emit("user::status", "Logado");
					return this.socketService.emit("user::login", { logado: true });
				}
			}
		} catch (error) {
			if (error.message === "SIGAA: Invalid credentials.") {
				this.socketService.emit("user::login", {
					logado: false,
					error: "Credenciais inválidas"
				});
			} else if (error.message === "SIGAA: Session expired.") {
				this.socketService.emit("user::login", {
					logado: false,
					error: "eita, alguma coisa aconteceu!"
				});
			} else {
				console.error(error);
				return;
			}
			return this.socketService.emit("user::status", "Deslogado");
		}
	}
	/**
	 *  Realiza evento de envio de informações do usuario
	 */
	async info() {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const { JSESSIONID, username, sigaaURL } = SessionMap.get<ISessionMap>(uniqueID);

			const responseCache = ResponseCache.getResponse<IStudentDTOProps>({ uniqueID, event: "user::info", query: { username } });
			if (responseCache) {
				console.log("[user - info] - cache hit");
				return this.socketService.emit("user::info", responseCache);
			}

			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);
			const accountService = new AccountService(account);
			const fullName = await accountService.getFullName();
			const defaultProfilePictureURL = new URL("https://sigaa.ifsc.edu.br/sigaa/img/no_picture.png");
			const userProfilePictureURL = await accountService.getProfilePictureURL();
			const profilePictureURL = userProfilePictureURL ? userProfilePictureURL : defaultProfilePictureURL;
			const emails = await accountService.getEmails();

			sigaaInstance.close();
			const studentDTO = new StudentDTO({
				username,
				fullName,
				profilePictureURL: profilePictureURL.href,
				emails,
			});
			ResponseCache.setResponse({ uniqueID, event: "user::info", query: { username } }, studentDTO.toJSON(), 3600 * 1.5)
			return this.socketService.emit("user::info", studentDTO.toJSON());
		} catch (error) {
			console.error(error);
			return;
		}
	}
	/**
	 * Realiza logoff da conta
	 * @param params 
	 * @returns 
	 */
	async logoff() {
		try {
			console.log(`[${this.socketService.id}] Deslogando`);
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			this.socketService.emit("user::status", "Deslogando");
			SocketReferenceMap.del(this.socketService.id);
			const { JSESSIONID } = SessionMap.get<ISessionMap>(uniqueID);
			RequestStackCache.del(JSESSIONID);
			SessionMap.del(uniqueID);
			BondCache.deleteBonds(uniqueID);
			ResponseCache.deleteResponses(uniqueID);
			this.logado = false;
			this.socketService.emit("user::status", "Deslogado");
			return this.socketService.emit("user::login", { logado: false });
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}