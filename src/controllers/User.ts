import { UserSIGAA } from "../api/UserSIGAA";
import { session } from "../helpers/Session";
import { baseURL } from "../apiConfig.json";
import { Account } from "sigaa-api";
import { cacheService } from "../services/cacheService";
import { Socket } from "socket.io";
import { cacheUtil } from "../services/cacheUtil";
import { events } from "../apiConfig.json"
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
    async login( credentials, params: { socket: Socket } ) {
        const { socket } = params;
        const eventName = events.user.login;
        const statusEventName = events.user.status;
        const apiEventError = events.api.error;
        try {
            if ( this.logado ) return "Usuario já esta logado";
            const { cache, uniqueID } = cacheUtil.restore( socket.id )
            const userSigaa = new UserSIGAA();
            let account: Account;
            if ( !cache?.account ) {
                socket.emit( statusEventName, "Logando" )
                if ( credentials.username && credentials.password ) {
                    account = await userSigaa.login( credentials, this.baseURL );
                } else {
                    throw new Error( "Usuario não informou as credenciais" )
                }
                cacheUtil.merge( uniqueID, { account, jsonCache: [], rawCache: {}, time: new Date().toISOString() } )
            } else {
                account = cache.account;
            }
            this.logado = true;
            console.log( "Logado" );
        } catch ( error ) {
            console.error( error );
            socket.emit( apiEventError, error.message )
            this.logado = false;
        }
        socket.emit( statusEventName, this.logado ? "Logado" : "Deslogado" )
        return socket.emit( eventName, JSON.stringify( { logado: this.logado } ) )
    }
    /**
     *  Realiza evento de envio de informações do usuario
     * @param params 
     */
    async info( params: { socket: Socket } ) {
        const { socket } = params;
        const eventName = events.user.info;
        const apiEventError = events.api.error;
        try {
            const { cache, uniqueID } = cacheUtil.restore( socket.id )
            if ( !cache.account ) throw new Error( "Usuario não tem account" )
            const account: Account = cache.account;
            const info = { fullName: await account.getName(), profilePictureURL: await account.getProfilePictureURL() }
            socket.emit( eventName, JSON.stringify( info ) )
        } catch ( error ) {
            console.error( error );
            socket.emit( apiEventError, error.message )
        }
    }
    /**
     * Realiza logoff da conta
     * @param params 
     * @returns 
     */
    async logoff( params: { socket: Socket } ) {
        const eventName = events.user.login;
        const statusEventName = events.user.status;
        const apiEventError = events.api.error;
        const { socket } = params;
        try {
            const { cache, uniqueID } = cacheUtil.restore( socket.id )
            if ( !cache.account ) throw new Error( "Usuario não tem account" )
            socket.emit( statusEventName, "Deslogando" )
            await cache.account.logoff()
            session.delete( socket.id )
            cacheService.del( uniqueID )
            console.log( "Deslogado" )
            this.logado = false;
            socket.emit( statusEventName, "Deslogado" )
            return socket.emit( eventName, JSON.stringify( { logado: false } ) )
        } catch ( error ) {
            console.error( error );
            socket.emit( apiEventError, error.message )
            return false;
        }
    }
}