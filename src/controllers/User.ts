import { sigaaIfscURL } from "../apiConfig.json";
import { Page, Request, Sigaa } from "sigaa-api";
import { cacheService } from "../services/cacheService";
import { CacheType, cacheUtil } from "../services/cacheUtil";
import { events } from "../apiConfig.json";
import AuthenticationService from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { Socket } from "socket.io";
import { UserDTO } from "../DTOs/User.DTO";
import { SigaaRequestStack } from "sigaa-api/dist/helpers/sigaa-request-stack";

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
				console.log(`[${credentials.username} - ${this.socketService.id} - ${sigaaURL.origin}] Logado (senha) com sucesso`);
				const uniqueID: string = cacheService.get(this.socketService.id);
				cacheUtil.merge(uniqueID, { JSESSIONID, username: credentials.username, sigaaURL: sigaaURL.origin });
				sigaaInstance.close();
				this.logado = true;
			} else {
				// login com o JSESSIONID
				const uniqueID: string = cacheService.get(this.socketService.id);
				const cache = cacheService.get<CacheType>(uniqueID);
				if (!cache) {
					this.logado = false;
				} else {
					if (!cache.JSESSIONID) throw new Error("API: No JSESSIONID found in cache.");
					this.socketService.emit("user::status", "Logando");
					const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, cache.JSESSIONID);
					await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
					// const account = await AuthenticationService.parseAccount(sigaaInstance, page);
					console.log(`[${cache.username} - ${this.socketService.id}] Logado (sessão) com sucesso`);
					sigaaInstance.close();
					this.logado = true;
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
				this.socketService.emit(apiEventError, error.message);
			}
			return this.socketService.emit("user::status", "Deslogado");
		}
		this.socketService.emit("user::status", this.logado ? "Logado" : "Deslogado");
		return this.socketService.emit("user::login", { logado: this.logado });
	}
	/**
	 *  Realiza evento de envio de informações do usuario
	 */
	async info() {
		const apiEventError = events.api.error;
		try {
			const uniqueID: string = cacheService.get(this.socketService.id);
			const cache = cacheService.get<CacheType>(uniqueID);

			const sigaaURL = new URL(cache.sigaaURL);
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, cache.JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);

			const accountService = new AccountService(account);
			const fullName = await accountService.getFullName();
			const defaultProfilePictureURL = new URL("https://sigaa.ifsc.edu.br/sigaa/img/no_picture.png");
			const profilePictureURL = await accountService.getProfilePictureURL();
			const emails = await accountService.getEmails();

			sigaaInstance.close();
			const userDTO = new UserDTO({
				fullName,
				profilePictureURL: profilePictureURL.href ?? defaultProfilePictureURL.href,
				emails,
				username: cache.username
			});
			return this.socketService.emit("user::info", userDTO.toJSON());
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
			const uniqueID: string = cacheService.get(this.socketService.id);
			const cache = cacheService.get<CacheType>(uniqueID);
			// const sigaaURL = new URL(cache.sigaaURL);
			// const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, cache.JSESSIONID);
			// const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			// const account = await AuthenticationService.parseAccount(sigaaInstance, page);
			// const accountService = new AccountService(account);
			this.socketService.emit("user::status", "Deslogando");
			//accountService.logoff()
			// httpSession.close();
			cacheService.del(this.socketService.id);
			cacheService.del(uniqueID);
			cacheService.del(`requestStackInstance@${cache.JSESSIONID}`);
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