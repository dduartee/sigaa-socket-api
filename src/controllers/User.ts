import { sigaaIfscURL } from "../apiConfig.json";
import { Page, Request, Sigaa } from "sigaa-api";
import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { Socket } from "socket.io";
import { StudentDTO } from "../DTOs/Student.DTO";
import { SigaaRequestStack } from "sigaa-api/dist/helpers/sigaa-request-stack";
import StudentMap from "../services/StudentMap";
import SessionMap from "../services/SessionMap";
import SocketReferenceMap from "../services/SocketReferenceMap";

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
		const sigaaURL = new URL(credentials.sigaaURL || sigaaIfscURL);
		const apiEventError = events.api.error;
		try {
			// login com credenciais
			if (credentials.username && credentials.password) {
				this.socketService.emit("user::status", "Logando");
				const requestStackController = new SigaaRequestStack<Request, Page>();
				const sigaaInstance = new Sigaa({ url: sigaaURL.toString(), requestStackController });
				const { JSESSIONID } = await AuthenticationService.loginWithCredentials(credentials, sigaaInstance, requestStackController);
				console.log(`[${credentials.username} - ${this.socketService.id}] Logado (senha) com sucesso`);
				const uniqueID = SocketReferenceMap.get(this.socketService.id);
				SessionMap.set(uniqueID, { JSESSIONID, username: credentials.username, sigaaURL: sigaaURL.href });
				sigaaInstance.close();
				this.socketService.emit("user::status", "Logado");
				return this.socketService.emit("user::login", { logado: true });
			} else {
				// login com o JSESSIONID
				const uniqueID = SocketReferenceMap.get(this.socketService.id);
				if (!SessionMap.has(uniqueID)) {
					this.socketService.emit("user::status", "Deslogado");
					this.socketService.emit("user::login", { logado: false });
				} else {
					const { JSESSIONID, username } = SessionMap.get(uniqueID);
					if (credentials.username !== username) throw new Error("API: Username in cache does not match the username in the request.");
					if (!JSESSIONID) throw new Error("API: No JSESSIONID found in cache.");
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
				return this.socketService.emit(apiEventError, error.message);
			}
			return this.socketService.emit("user::status", "Deslogado");
		}
	}
	/**
	 *  Realiza evento de envio de informações do usuario
	 */
	async info() {
		const apiEventError = events.api.error;
		try {
			const uniqueID = SocketReferenceMap.get(this.socketService.id);
			const { JSESSIONID, username, sigaaURL } = SessionMap.get(uniqueID);

			if (StudentMap.has(uniqueID)) {
				console.log(`[${username} - ${this.socketService.id}] Enviando informações do estudante do cache`);
				return this.socketService.emit("user::info", StudentMap.get(uniqueID));
			}

			const url = new URL(sigaaURL);
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(url, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);
			const accountService = new AccountService(account);
			const fullName = await accountService.getFullName();
			const defaultProfilePictureURL = new URL("https://sigaa.ifsc.edu.br/sigaa/img/no_picture.png");
			const profilePictureURL = await accountService.getProfilePictureURL();
			const emails = await accountService.getEmails();

			sigaaInstance.close();
			const studentDTO = new StudentDTO({
				fullName,
				profilePictureURL: profilePictureURL.href ?? defaultProfilePictureURL.href,
				emails,
				username
			});
			StudentMap.set(uniqueID, studentDTO.toJSON());
			return this.socketService.emit("user::info", studentDTO.toJSON());
		} catch (error) {
			console.error(error);
			return this.socketService.emit(apiEventError, error.message);
		}
	}
	/**
	 * Realiza logoff da conta
	 * @param params 
	 * @returns 
	 */
	async logoff() {
		const apiEventError = events.api.error;
		try {
			const uniqueID = SocketReferenceMap.get(this.socketService.id);
			this.socketService.emit("user::status", "Deslogando");
			SocketReferenceMap.delete(this.socketService.id);
			SessionMap.delete(uniqueID);
			this.logado = false;
			this.socketService.emit("user::status", "Deslogado");
			return this.socketService.emit("user::login", { logado: false });
		} catch (error) {
			console.error(error);
			this.socketService.emit(apiEventError, error.message);
			return false;
		}
	}
}