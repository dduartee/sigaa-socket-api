import { Account, Sigaa} from "sigaa-api";
import { Socket } from 'socket.io';
export default class User {
    baseURL: string
    account: Account
    fullName: string
    constructor({ baseURL }) {
        this.baseURL = baseURL;
    }
    /**
     * handle login
     * @param credentials {username, password}
     * @param client Socket
     */
    async login(credentials: { username: string, password: string }, client: Socket) {

        const {username, password} = credentials;
        
        const sigaa = new Sigaa({ url:this.baseURL});

        console.log(username+": logando...")

        await sigaa.login(username, password).then(async account => {
            this.account = account;
            this.fullName = await this.account.getName()
            console.log(this.fullName +" Logado")
            client.emit('status', {account: true, error: false})
            return client.emit('status', (this.fullName+": Logado"));
            // {account: true, error: false}
        }).catch(error => {
            console.error(error);
            client.emit('status', {account: false, error: true})
            return client.emit('status', error)
        })
    }
    /**
     * handle info
     * @param client Socket
     * @returns 
     */
    async info(client: Socket) {
        return client.emit('status', {fullName: this.fullName})
    }

    /**
     * handle logoff
     * @param client Socket
     */
    async logoff(client: Socket) {
        console.log(this.fullName+" Deslogando")
        await this.account.logoff().then(async () => {
            console.log(this.fullName+" Deslogado")
            return client.emit('status', this.fullName+" Deslogado")
            // {error: false, logoff: true}
        }).catch(error => {
            console.error(error)
            return client.emit('status', error)
            // {error: true, logoff: false}
        })
        this.account = null;
        this.fullName = null;
    }
};
