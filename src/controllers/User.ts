import { session } from "../helpers/Session";
import { baseURL } from "../apiConfig.json";
import { Sigaa } from "sigaa-api";
import { cacheService } from "../services/cacheService";
import { cacheUtil } from "../services/cacheUtil";
import { events } from "../apiConfig.json"
import Authentication from "../services/sigaa-api/Authentication.service";
import { AccountService } from "../services/sigaa-api/Account.service";
import { Socket } from "socket.io";
import { UserDTO } from "../DTOs/User.DTO";
export class User {
    logado: boolean;
    constructor(private socketService: Socket) {}
    /**
     * Realiza evento de login
     * @param credentials 
     * @returns 
     */
    async login(credentials: {
        username: string;
        password: string;
    }) {
        const eventName = events.user.login;
        const statusEventName = events.user.status;
        const apiEventError = events.api.error;
        if (this.logado) return "Usuario já esta logado";
        try {
            // login com credenciais
            if (credentials.username && credentials.password) {
                this.socketService.emit(statusEventName, "Logando")
                const sigaaInstance = new Sigaa({ url: baseURL });
                const { JSESSIONID } = await Authentication.loginWithCredentials(credentials, sigaaInstance);
                const uniqueID: string = cacheService.get(this.socketService.id)
                cacheUtil.merge(uniqueID, { JSESSIONID, username: credentials.username })
                sigaaInstance.close()
                this.logado = true;
            } else {
                // login com o JSESSIONID
                const { cache } = cacheUtil.restore(this.socketService.id)
                if (cache?.JSESSIONID) {
                    this.socketService.emit(statusEventName, "Logando")
                    const { httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
                    httpSession.close()
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
        this.socketService.emit(statusEventName, this.logado ? "Logado" : "Deslogado")
        return this.socketService.emit(eventName, { logado: this.logado })
    }
    /**
     *  Realiza evento de envio de informações do usuario
     */
    async info() {
        const eventName = events.user.info;
        const apiEventError = events.api.error;
        try {
            const { cache, uniqueID } = cacheUtil.restore(this.socketService.id)
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
            const accountService = new AccountService(account)
            const fullName = await accountService.getFullName()
            const {href: profilePictureURL} = await accountService.getProfilePictureURL()
            const emails = await accountService.getEmails()
            httpSession.close()
            const userDTO = new UserDTO({
                fullName,
                profilePictureURL,
                emails,
                username: cache.username
            })
            this.socketService.emit(eventName, userDTO.toJSON())
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
        const eventName = events.user.login;
        const statusEventName = events.user.status;
        const apiEventError = events.api.error;
        try {
            const { cache, uniqueID } = cacheUtil.restore(this.socketService.id)
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
            const accountService = new AccountService(account)
            this.socketService.emit(statusEventName, "Deslogando")
            accountService.logoff()
            httpSession.close()
            session.delete(this.socketService.id)
            cacheService.del(uniqueID)
            this.logado = false;
            this.socketService.emit(statusEventName, "Deslogado")
            return this.socketService.emit(eventName, { logado: false })
        } catch (error) {
            console.error(error);
            this.socketService.emit(apiEventError, error.message)
            return false;
        }
    }
}