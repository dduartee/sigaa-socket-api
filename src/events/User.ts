import { Account, Sigaa } from "sigaa-api";
import { Socket } from 'socket.io';
export default class User {
    baseURL: string
    account: Account
    fullName: string
    logado: boolean = false;
    constructor({ baseURL }) {
        this.baseURL = baseURL;
    }
    /**
     * handle login
     * @param credentials {username, password}
     * @param client Socket
     */
    async login(credentials: { username: string, password: string }, client: Socket) {
        try {
            if(this.logado) return this.logado = true
            const { username, password } = credentials;

            const sigaa = new Sigaa({ url: this.baseURL });

            console.log(username + ": logando...")
            client.emit('status', "Logando...")
            const account = await sigaa.login(username, password)
            this.account = account;
            this.fullName = await this.account.getName()
            console.log(this.fullName + " Logado")
            client.emit('status', "Logado com sucesso")
            this.logado = true;
            return client.emit('info', (this.fullName + ": Logado"));
        } catch (error) {
            console.error(error);
            client.emit('status', "Não foi possivel fazer login, tente novamente")
            this.logado = false;
            return client.emit('errors', error.message)
        }
    }
    /**
     * handle logoff
     * @param client Socket
     */
    async logoff(client: Socket) {
        try {
            if(this.logado == false) {
                return client.emit('errors', "Sigaa-Socket-API: Você não esta logado")
            }
            client.emit('status', "Deslogando...")
            await this.account.logoff()
            console.log(this.fullName + " Deslogado")
            client.emit('status', "Deslogado com sucesso");
            this.account = null;
            this.fullName = null;
            this.logado = false;
            return client.emit('info', "");
        } catch (error) {
            console.error(error)
            client.emit('status', "Não foi possivel fazer logoff")
            this.logado = false;
            return client.emit('errors', error.message)
        }
    }
};
