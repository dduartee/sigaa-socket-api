import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UserSIGAA } from '../api/UserSIGAA';
import cacheUtil from "../util/cacheUtil";
import NodeCache from 'node-cache';
import { Account } from 'sigaa-api';
import { ICacheUtil, CacheType } from '../util/cacheUtil';
import { Unique } from './Unique';
interface IUser {
    login(credentials: UserCredentials, params: { socket: Socket }): any
    logoff(params: { socket: Socket }): any
}

export type UserCredentials = {
    username: string;
    password: string;
    token: string;
}

export class User implements IUser {
    client: ICacheUtil;
    baseURL: string;
    logado: boolean
    uniqueID: string
    UserSIGAA: UserSIGAA;

    constructor(params: { baseURL: string }) {
        const { baseURL } = params;
        this.baseURL = baseURL;
        this.UserSIGAA = new UserSIGAA();
    }

    /**
     * Controla o login do usuario
     * @param credentials UserCredentials {username: string, password: string, token: string}
     * @param params {socket: Socket, uniqueID: string}
     * @returns boolean
     */
    async login(credentials: UserCredentials, params: { socket: Socket<DefaultEventsMap, DefaultEventsMap>, uniqueID: string }) {
        try {
            if (this.logado) return;
            const { socket } = params;
            const unique = new Unique();
            const uniqueID = unique.verify(params.uniqueID)
            socket.emit("user::login", JSON.stringify({ message: "Logando" }))
            const account = await this.UserSIGAA.login(credentials, this.baseURL)
            unique.reference(uniqueID, socket)
            cacheUtil.set(uniqueID, { account })
            this.uniqueID = uniqueID;
            this.logado = true;
            console.log("Logado")
            socket.emit("user::login", JSON.stringify({ message: "Logado" }))
            return true;
        } catch (error) {
            console.error("UserController -> login: " + error);
            return false
        }
    }

    /**
     * Controla o resgate de informações do usuario
     * @param params {socket: Socket}
     * @returns boolean
     */
    async info(params: { socket: Socket<DefaultEventsMap, DefaultEventsMap> }) {
        try {
            const { socket } = params;
            const cache: CacheType = cacheUtil.get(this.uniqueID);
            const { account } = cache;
            const info = await this.UserSIGAA.info(account);
            socket.emit('user::info', JSON.stringify({ info }))
            return true;

        } catch (error) {
            console.error("UserController -> info: " + error);
            return false;
        }
    }
    /**
     * Controla o logoff do usuario
     * @param params {socket: Socket}
     * @returns boolean
     */
    async logoff(params: { socket: Socket<DefaultEventsMap, DefaultEventsMap> }) {
        try {
            if (!this.logado) throw new Error("Usuario não esta logado");
            const { socket } = params;
            socket.emit("user::logoff", JSON.stringify({ message: "Deslogando" }))
            const uniqueID: string = this.uniqueID ?? cacheUtil.get(socket.id);
            const cache: CacheType = cacheUtil.take(uniqueID);
            const { account } = cache;
            await this.UserSIGAA.logoff(account)
            cacheUtil.del(socket.id)
            this.logado = false;
            console.log("Deslogado")
            socket.emit("user::logoff", JSON.stringify({ message: "Deslogado" }))
            return true;
        } catch (error) {
            console.error("UserController -> logoff: " + error);
            return false;
        }
    }
}