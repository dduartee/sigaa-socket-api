import cacheUtil from "../util/cacheUtil";
import { Socket } from 'socket.io';
import { CacheType } from '../util/cacheUtil';
import { BondSIGAA } from '../api/BondSIGAA';
import { Account, CourseStudent, Student, StudentBond } from 'sigaa-api';

export class Bond {
    BondSIGAA: BondSIGAA;
    constructor() {
        this.BondSIGAA = new BondSIGAA();
    }
    /**
     * Controla listagem de vinculos
     * @param params {socket: Socket, inactive?: boolean}
     * @returns boolean
     */
    async list(params: { socket: Socket, inactive?: boolean }) {
        try {
            const { socket, inactive } = params;
            const uniqueID: string = cacheUtil.get(socket.id);
            if (!uniqueID) throw new Error("Socket.id não tem uniqueID referenciado");
            const { account }: CacheType = cacheUtil.get(uniqueID);
            const allBonds: StudentBond[][] = await this.BondSIGAA.getBonds(account, inactive)
            const BondsJSON = [];

            for (const bonds of allBonds) for (const bond of bonds) {
                console.log(bond.program)
                BondsJSON.push(Bond.parser({ bond }))
            }
            
            socket.emit("bond::list", JSON.stringify(BondsJSON))
            return true;

        } catch (error) {
            console.error(error);
            return false;
        }
    }

    /**
     * Parser de Bonds
     * @param params {bond: StudentBond, courses?: CourseStudent[]}
     * @returns [{program, registration, courses}]
     */
    static parser(params: { bond: StudentBond, courses?: CourseStudent[] }) {
        const { bond, courses } = params
        return {
            program: bond.program,
            registration: bond.registration,
            courses
        };
    }
}