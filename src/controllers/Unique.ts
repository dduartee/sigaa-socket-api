import { v4 } from "uuid";
import cacheUtil from "../util/cacheUtil";
import { Socket } from 'socket.io';

export class Unique {
    id: string;
    /**
     * Gera id, referencia com o socket.id e envia para o cliente
     * @param socket Socket
     * @returns nothing
     */
    generate(socket: Socket) {
        this.id = v4();
        cacheUtil.set(socket.id, this.id)
        socket.emit("UniqueID::store", this.id)
        return;
    }
    /**
     * Referencia o socket.id com o id
     * @param id string
     * @param socket Socket
     * @returns nothing
     */
    reference(id: string, socket: Socket) {
        this.id = id;
        cacheUtil.set(socket.id, id)
        socket.emit("UniqueID::status", JSON.stringify({message: "Referenced"}))
        return;
    }
    /**
     * Verifica se o id é valido se não for ele retorna um novo
     * @param id string
     * @returns string
     */
    verify(id: string) {
        return this.id = id??v4();
    }
}