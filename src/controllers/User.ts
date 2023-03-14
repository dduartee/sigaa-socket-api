import { InstitutionType, Page, Request, Sigaa } from "sigaa-api";
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
import InstitutionService from "../services/sigaa-api/Institutions.service";

export type LoginParams = {
	username: string;
	password: string;
	institution: InstitutionType; // acronimo da instituição (IFSC, UnB, etc)
}
export class User {
	logado: boolean;
	constructor(private socketService: Socket) { }
	/**
	 * Realiza evento de login
	 * @param loginParams 
	 * @returns 
	 */
	async login(loginParams: LoginParams) {
		try {
			const uniqueID = SocketReferenceMap.get<string>(this.socketService.id);
			const institution = InstitutionService.getFromAcronym(loginParams.institution);
			if (!institution) throw new Error(`Institution ${loginParams.institution} not found`);
			
			const sigaaURL = institution.url.href;
			// login com credenciais
			if (loginParams.username && loginParams.password) {
				console.log(`[${loginParams.username}: ${this.socketService.id}] Logando (senha)`);
				this.socketService.emit("user::status", "Logando");
				const requestStackController = new SigaaRequestStack<Request, Page>();
				const sigaaInstance = new Sigaa({ url: sigaaURL, institution: loginParams.institution, requestStackController });
				const { JSESSIONID } = await AuthenticationService.loginWithCredentials(loginParams, sigaaInstance);
				RequestStackCache.set(JSESSIONID, requestStackController);
				console.log(`[${loginParams.username}: ${this.socketService.id}] Logado (senha) com sucesso`);
				SessionMap.set(uniqueID, { JSESSIONID, username: loginParams.username, sigaaURL });
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
					if (loginParams.username !== username) throw new Error("API: Username in cache does not match the username in the request.");
					if (!JSESSIONID) throw new Error("API: No JSESSIONID found in cache.");
					console.log(`[${loginParams.username}: ${this.socketService.id}] Logando (sessão)`);
					this.socketService.emit("user::status", "Logando");
					const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
					await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
					console.log(`[${username}: ${this.socketService.id}] Logado (sessão) com sucesso`);
					sigaaInstance.close();
					this.socketService.emit("user::status", "Logado");
					return this.socketService.emit("user::login", { logado: true });
				}
			}
		} catch (error) {
			if (error.message === "SIGAA: Invalid loginParams.") {
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
				return this.socketService.emit("user::info", responseCache);
			}
			const sigaaInstance = AuthenticationService.getRehydratedSigaaInstance(sigaaURL, JSESSIONID);
			const page = await AuthenticationService.loginWithJSESSIONID(sigaaInstance);
			const account = await AuthenticationService.parseAccount(sigaaInstance, page);
			const accountService = new AccountService(account);
			const fullName = await accountService.getFullName();
			const defaultProfilePictureURL = new URL("/sigaa/img/no_picture.png", sigaaURL);
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
			ResponseCache.setResponse({ uniqueID, event: "user::info", query: { username } }, studentDTO.toJSON(), 3600 * 1.5);
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
			console.log(`[${this.socketService.id}] Deslogado`);
			return this.socketService.emit("user::login", { logado: false });
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}