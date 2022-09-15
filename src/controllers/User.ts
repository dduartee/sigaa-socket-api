import { session } from "../helpers/Session";
import { baseURL } from "../apiConfig.json";
import { Page, Request, Sigaa } from "sigaa-api";
import { cacheService } from "../services/cacheService";
import { cacheUtil } from "../services/cacheUtil";
import { events } from "../apiConfig.json"
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { Socket } from "socket.io";
import { UserDTO } from "../DTOs/User.DTO";
import { SigaaRequestStack } from "sigaa-api/dist/helpers/sigaa-request-stack";
export class User {
    logado: boolean;
    constructor(private socketService: Socket) { }
    /**
     * Realiza evento de login
     * @param credentials 
     * @returns 
     */
    async login(credentials: {
        username: string;
        password: string;
    }) {
        const apiEventError = events.api.error;
        if (this.logado) return "Usuario já esta logado";
        try {
            // login com credenciais
            if (credentials.username && credentials.password) {
                this.socketService.emit("user::status", "Logando")
                const requestStackController = new SigaaRequestStack<Request, Page>()
                const sigaaInstance = new Sigaa({ url: baseURL, requestStackController });
                const { JSESSIONID } = await Authentication.loginWithCredentials(credentials, sigaaInstance, requestStackController);
                const uniqueID: string = cacheService.get(this.socketService.id)
                cacheUtil.merge(uniqueID, { JSESSIONID, username: credentials.username })
                sigaaInstance.close()
                console.log(`[${credentials.username} - ${this.socketService.id}] Logado (senha) com sucesso`)
                this.logado = true;
            } else {
                // login com o JSESSIONID
                const { cache } = cacheUtil.restore(this.socketService.id)
                if (cache) {
                    if (!cache?.JSESSIONID) {
                        throw new Error("API: No JSESSIONID found in cache.");
                    }
                    this.socketService.emit("user::status", "Logando")
                    const { httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
                    httpSession.close()
                    console.log(`[${cache.username} - ${this.socketService.id}] Logado (sessão) com sucesso`)
                    this.logado = true;
                } else {
                    this.logado = false;
                }
            }
        } catch (error) {
            console.error(error);
            this.socketService.emit(apiEventError, error.message)
            this.logado = false;
        }
        this.socketService.emit("user::status", this.logado ? "Logado" : "Deslogado")
        return this.socketService.emit("user::login", { logado: this.logado })
    }
    /**
     *  Realiza evento de envio de informações do usuario
     */
    async info() {
        const apiEventError = events.api.error;
        try {
            const { cache, uniqueID } = cacheUtil.restore(this.socketService.id)
            if (!cache?.JSESSIONID) {
                throw new Error("API: No JSESSIONID found in cache.");
            }
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
            const accountService = new AccountService(account)
            const fullName = await accountService.getFullName()
            const { href: profilePictureURL } = await accountService.getProfilePictureURL() ?? new URL("https://sigaa.ifsc.edu.br/sigaa/img/no_picture.png");
            const emails = await accountService.getEmails()
            httpSession.close()
            const userDTO = new UserDTO({
                fullName,
                profilePictureURL,
                emails,
                username: cache.username
            })
            this.socketService.emit("user::info", userDTO.toJSON())
        } catch (error) {
            console.error(error);
            this.socketService.emit(apiEventError, error.message)
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
            const { cache, uniqueID } = cacheUtil.restore(this.socketService.id)
            if (!cache.JSESSIONID) {
                throw new Error("API: No JSESSIONID found in cache.");
            }
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
            const accountService = new AccountService(account)
            this.socketService.emit("user::status", "Deslogando")
            //accountService.logoff()
            httpSession.close()
            session.delete(this.socketService.id)
            cacheService.del(uniqueID)
            cacheService.del(`requestStackInstance@${cache.JSESSIONID}`)
            this.logado = false;
            this.socketService.emit("user::status", "Deslogado")
            return this.socketService.emit("user::login", { logado: false })
        } catch (error) {
            console.error(error);
            this.socketService.emit(apiEventError, error.message)
            return false;
        }
    }
}