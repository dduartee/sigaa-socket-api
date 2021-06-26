import { UserSIGAA } from "../api/UserSIGAA";
import { session } from "../helpers/Session";
import { baseURL } from "../apiConfig.json";
import { Account } from "sigaa-api";
import { cacheService } from "../services/cacheService";
import { Socket } from "socket.io";
import { cacheUtil } from "../services/cacheUtil";
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
        try {
            if (this.logado) return "Usuario já esta logado";
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            const userSigaa = new UserSIGAA();
            socket.emit('user::status', JSON.stringify({ message: "Logando" }))
            const account = cache?.account ?? await userSigaa.login(credentials, this.baseURL)
            this.logado = true;
            cacheUtil.merge(uniqueID, { account, jsonCache: [], rawCache: {}, time: new Date().toISOString() })
            console.log("Logado");
        } catch (error) {
            console.error(error);
            this.logado = false;
        }
        socket.emit('user::status', JSON.stringify({ message: this.logado ? "Logado" : "Deslogado" }))
        return socket.emit('user::login', JSON.stringify({ logado: this.logado }))
    }
    /**
     *  Realiza evento de envio de informações do usuario
     * @param params 
     */
    async info(params: { socket: Socket }) {
        try {
            if (!this.logado) throw new Error("Usuario não esta logado")
            const { socket } = params;
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            if (!cache.account) throw new Error("Usuario não tem account")
            const account: Account = cache.account;
            const info = { fullName: await account.getName(), profilePictureURL: await account.getProfilePictureURL() }
            socket.emit('user::info', JSON.stringify(info))
        } catch (error) {
            console.error(error)
        }
    }
    /**
     * Realiza logoff da conta
     * @param params 
     * @returns 
     */
    async logoff(params: { socket: Socket }) {
        try {
            if (!this.logado) throw new Error("Usuario não esta logado")
            const { socket } = params;
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            if (!cache.account) throw new Error("Usuario não tem account")
            socket.emit('user::status', "Deslogando")
            await cache.account.logoff()
            session.delete(socket.id)
            cacheService.del(uniqueID)
            console.log("Deslogado")
            this.logado = false;
            socket.emit('user::status', "Deslogado")
            return socket.emit('user::login', JSON.stringify({ logado: false }))
        } catch (err) {
            console.error(err)
            return false;
        }
    }
}