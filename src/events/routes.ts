import { Socket } from 'socket.io';
import User from './User';
import { baseURL } from "../apiConfig.json";
import Courses from './Courses';
import Bonds from './Bonds';
import Grades from './Grades';
import socketCache from '../models/socketCache';
import { v4 } from "uuid";
export default (client: Socket, jwt, cache: socketCache) => {
    console.log(client.id)
    client.emit('id', client.id)
    
    /**
     * Evento de usuario
     */
    const user = new User(baseURL) // instancia usuario para o CLIENTE
    client.on("user::login", async credentials => await user.login(credentials, client, cache, jwt))
    client.on("user::logoff", async () => await user.logoff(client, cache))
    
    const bonds = new Bonds()
    client.on('bonds::list', async () => await bonds.list(client, cache))

    const courses = new Courses();
    client.on("courses::list", async () => await courses.list(client, cache))

    const grades = new Grades();
    client.on("grades::list", async () => await grades.list(client, cache))
    client.on("grades::specific", async code => await grades.specific(code, client, cache))
    
    client.on("disconnect", reason => {
        cache.del(client.id) // deleta o id
        console.log(reason); // "ping timeout"
    });
};
function uuid(uuid: any) {
    throw new Error('Function not implemented.');
}

