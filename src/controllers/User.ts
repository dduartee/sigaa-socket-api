import { UserSIGAA } from "../api/UserSIGAA";
import { session } from "./Session";
import { baseURL } from "../apiConfig.json";
import { Account } from "sigaa-api";
import { cacheService } from "../services/cacheService";
import { Socket } from "socket.io";
import { cacheUtil } from "../services/cacheUtil";
import { CacheController } from "./Cache";
export class User {
    baseURL: string;
    logado: boolean;
    constructor() {
        this.baseURL = baseURL;
    }
    async login(credentials, params: { socket: Socket }) {
        try {

            if (this.logado) throw new Error("Usuario já esta logado");
            this.logado = false;
            const { socket } = params;
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            const userSigaa = new UserSIGAA();
            socket.emit('user::status', JSON.stringify({ message: "Logando" }))
            const account = cache?.account ?? await userSigaa.login(credentials, this.baseURL)
            this.logado = true;
            cacheUtil.merge(uniqueID, { account })
            socket.emit('user::status', JSON.stringify({ message: "Logado" }))
            console.log("Logado")
            return socket.emit('user::login', JSON.stringify({ logado: true }))
        } catch (error) {
            console.error(error);
            return false;
        }
    }
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
    async logoff(params: { socket: Socket }) {
        try {
            if (!this.logado) throw new Error("Usuario não esta logado")
            const { socket } = params;
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            if (!cache.account) {
                throw new Error("Usuario não tem account")
            }
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