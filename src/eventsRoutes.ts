import { Socket } from 'socket.io';
import User from './events/User';
import { baseURL } from "./apiConfig.json";
export default (client: Socket) => {
    console.log(client.id)
    client.emit('id', client.id)
    /**
     * Evento de usuario
     */
    const user = new User({ baseURL }) // instancia usuario para o CLIENTE
    client.on("user::login", credentials => user.login(credentials, client))
    client.on("user::logoff", () => user.logoff(client))

    client.on("disconnect", reason => {
        console.log(reason); // "ping timeout"
    });
};
