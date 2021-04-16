import { Account, Sigaa } from "sigaa-api";
import { Socket } from 'socket.io';
import socketCache from '../models/socketCache';
import { v4 as uuid } from 'uuid';
import JWTController from '../controllers/JWTController';
export default class User {
    baseURL: string
    account: Account;
    userInfo: {
        fullName: string;
        photoURL: URL;
    };
    logado: boolean = false;
    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.logado = false;
    }
    /**
     * handle login
     * @param credentials {username, password}
     * @param client Socket
     */
    async login(credentials: { username: string, password: string, token: string }, client: Socket, cache: socketCache, jwt: JWTController) {
        try {
            if (cache.has(credentials.token)) { // se tiver o cache
                const { account } = cache.get(credentials.token)
                cache.set(client.id, {token: credentials.token})// referencia o sid com o jwt
                this.account = account;
                await this.getUserInfo()
                console.log(this.userInfo.fullName + ": logado pelo cache...")

            } else {
                if (this.logado) return; // se já estiver logado não logue de novo
                const { username, password } = credentials;
                const sigaa = new Sigaa({ url: this.baseURL });

                console.log(username + ": logando...")
                client.emit('status', JSON.stringify({ message: "Logando..." }));

                const account = await sigaa.login(username, password)
                this.account = account;

                const token = jwt.generate({ uniqueId: uuid(), time: new Date().toISOString(), username });
                cache.set(token, { account })
                client.emit('authentication', token) // gera jwt
                cache.set(client.id, {token})// referencia o sid com o jwt

                client.emit('userInfo', JSON.stringify(await this.getUserInfo()));
                console.log(this.userInfo.fullName + " Logado")
            }
            this.logado = true;
            client.emit('status', JSON.stringify({ message: "Logado com sucesso" }))
            return client.emit('info', JSON.stringify({ message: this.userInfo.fullName + ": Logado" }));
        } catch (error) {
            console.error(error);
            client.emit('status', JSON.stringify({ message: "Não foi possivel fazer login, tente novamente" }))
            this.logado = false;
            return client.emit('errors', error)
        }
    }

    public async getUserInfo() {
        this.userInfo = { fullName: await this.account.getName(), photoURL: await this.account.getProfilePictureURL() }
        return { userInfo: this.userInfo }
    }
    /**
     * handle logoff
     * @param client Socket
     */
    async logoff(client: Socket, cache: socketCache) {
        try {
            if (!this.logado) return;
            client.emit('status', JSON.stringify({ message: "Deslogando..." }))
            await this.account.logoff()
            console.log(this.userInfo.fullName + " Deslogado")
            client.emit('status', JSON.stringify({ message: "Deslogado com sucesso" }));
            this.account = null;
            this.logado = false;
            const ref = cache.get(client.id)
            cache.del(ref.token) // deleta o token
            cache.del(client.id) // deleta o sid
            return client.emit('info', JSON.stringify({ message: "" }));
        } catch (error) {
            console.error(error)
            client.emit('status', JSON.stringify({ message: "Não foi possivel fazer logoff" }))
            this.logado = false;
            return client.emit('errors', JSON.stringify({ message: error }))
        }
    }
};
