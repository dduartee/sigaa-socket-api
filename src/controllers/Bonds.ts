import { cacheUtil } from "../services/cacheUtil";
import { Account, StudentBond } from 'sigaa-api'
import { BondSIGAA } from "../api/BondSIGAA";
import { Socket } from "socket.io";
import { CacheController } from "./Cache";
export class Bonds {
    async list(params: { socket: Socket }, received?: { inactive: boolean }) {
        try {
            const { socket } = params;
            const { inactive } = received;
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            const newest: any = jsonCache ? CacheController.sortByDate(jsonCache) : []
            if (newest.received?.inactive == received.inactive) { // se no cache as options for igual
                return socket.emit("bond::list", JSON.stringify(newest["BondsJSON"]))
            }
            const allbonds = await new BondSIGAA().getBonds(account, inactive);
            const BondsJSON = []
            for (const bonds of allbonds) for (const bond of bonds) {
                BondsJSON.push(Bonds.parser({ bond }));
            }
            CacheController.storeCache(uniqueID, { jsonCache: [{ BondsJSON, time: new Date().toISOString(), received }] })
            return socket.emit("bond::list", JSON.stringify(BondsJSON));
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
    static parser(params: { bond: StudentBond, CoursesJSON?: any }) {
        const { bond, CoursesJSON } = params
        return {
            program: bond.program,
            registration: bond.registration,
            courses: CoursesJSON ?? []
        };
    }
}