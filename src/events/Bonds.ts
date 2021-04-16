import { Account, BondType, StudentBond } from 'sigaa-api';
import { Socket } from 'socket.io';
import socketCache from '../models/socketCache';
import { IsocketEvent } from '../abstracts/socketEvent';
export default class Bonds implements IsocketEvent {
    activeBonds: StudentBond[]
    account: any;

    /**
     * Lista todos os vinculos ativos
     * @param client : Socket
     * @returns 
     */
    async list(client: Socket, cache: socketCache) {
        try {
            const ref = cache.get(client.id)
            const { account } = cache.get(ref.token) // resgata account
            this.account = account

            const activeBonds: StudentBond[] = await this.account.getActiveBonds();
            this.activeBonds = activeBonds
            cache.append(ref.token, { activeBonds })
            const bondsJSON = [];
            for (const bond of activeBonds) {
                bondsJSON.push(Bonds.parse({ bond }))
            }
            client.emit('jsonData', JSON.stringify({ bonds: bondsJSON }))
            return;
        } catch (error) {
            console.error(error);
            client.emit('status', "Não foi possivel listar os vinculos...")
            return client.emit('errors', error)
        }
    }
    /**
     * Retorna em JSON
     * @param bond StudentBond
     * @param coursesJSON
     * @returns {program, registration, courses}
     */
    static parse(data: { bond: StudentBond, coursesJSON?: any }): object {
        return ({
            program: data.bond.program,
            registration: data.bond.registration,
            courses: data.coursesJSON
        })
    }
};
