import { session } from "../helpers/Session";
import { baseURL } from "../apiConfig.json";
import { Sigaa } from "sigaa-api";
import { cacheService } from "../services/cacheService";
import { Socket } from "socket.io";
import { cacheUtil } from "../services/cacheUtil";
import { events } from "../apiConfig.json"
import Authentication from "../services/sigaa-api/Authentication";
import { cacheHelper } from "../helpers/Cache";
export class User {
    baseURL: string;
    logado: boolean;
    constructor() {
        this.baseURL = baseURL;
    }
    /**
     * Realiza evento de login
     * @param credentials 
     * @param params 
     * @returns 
     */
    async login(credentials, params: { socket: Socket }) {
        const { socket } = params;
        const eventName = events.user.login;
        const statusEventName = events.user.status;
        const apiEventError = events.api.error;
        if (this.logado) return "Usuario já esta logado";
        try {
            // login com credenciais
            if (credentials.username && credentials.password) {
                socket.emit(statusEventName, "Logando")
                const sigaaInstance = new Sigaa({ url: this.baseURL });
                const { JSESSIONID } = await Authentication.loginWithCredentials(credentials, sigaaInstance);
                const { uniqueID } = cacheUtil.restore(socket.id)
                cacheUtil.merge(uniqueID, { JSESSIONID })
                sigaaInstance.close()
                this.logado = true;
            } else {
                // login com o JSESSIONID
                const { cache } = cacheUtil.restore(socket.id)
                if(cache?.JSESSIONID) {
                    socket.emit(statusEventName, "Logando")
                    const { httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
                    httpSession.close()
                    this.logado = true;
                } else {
                    this.logado = false;
                }
            }
        } catch (error) {
            console.error(error);
            socket.emit(apiEventError, error.message)
            this.logado = false;
        }
        socket.emit(statusEventName, this.logado ? "Logado" : "Deslogado")
        return socket.emit(eventName, JSON.stringify({ logado: this.logado }))
    }
    /**
     *  Realiza evento de envio de informações do usuario
     * @param params 
     */
    async info(params: { socket: Socket }) {
        const { socket } = params;
        const eventName = events.user.info;
        const apiEventError = events.api.error;
        try {
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
            const info = { fullName: await account.getName(), profilePictureURL: await account.getProfilePictureURL() }
            httpSession.close()
            socket.emit(eventName, JSON.stringify(info))
        } catch (error) {
            console.error(error);
            socket.emit(apiEventError, error.message)
        }
    }
    /**
     * Realiza logoff da conta
     * @param params 
     * @returns 
     */
    async logoff(params: { socket: Socket }) {
        const eventName = events.user.login;
        const statusEventName = events.user.status;
        const apiEventError = events.api.error;
        const { socket } = params;
        try {
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            const { account, httpSession } = await Authentication.loginWithJSESSIONID(cache.JSESSIONID)
            socket.emit(statusEventName, "Deslogando")
            await account.logoff()
            httpSession.close()
            session.delete(socket.id)
            cacheService.del(uniqueID)
            this.logado = false;
            socket.emit(statusEventName, "Deslogado")
            return socket.emit(eventName, JSON.stringify({ logado: false }))
        } catch (error) {
            console.error(error);
            socket.emit(apiEventError, error.message)
            return false;
        }
    }
}