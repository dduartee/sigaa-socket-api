import { cacheUtil, jsonCache } from "../services/cacheUtil";
import { StudentBond } from 'sigaa-api'
import { BondSIGAA } from "../api/BondSIGAA";
import { Socket } from "socket.io";
import { CacheController } from "./Cache";
export class Bonds {
    /**
     * Lista vinculos com inativos opcional
     * @param params {socket}
     * @param received {inactive}
     * @returns 
     */
    async list(params: { socket: Socket }, received?: jsonCache["received"]) {
        try {
            const { socket } = params;
            const { inactive } = received;
            const { cache, uniqueID } = cacheUtil.restore(socket.id)
            if (!cache.account) throw new Error("Usuario não tem account")
            const { account, jsonCache } = cache
            const newest = CacheController.getNewest(jsonCache, received)
            if (newest) {
                return socket.emit("bond::list", JSON.stringify(newest["BondsJSON"]))
            }
            const bonds = await new BondSIGAA().getBonds(account, inactive);
            const BondsJSON = []
            for (const bond of bonds) {
                BondsJSON.push(Bonds.parser({ bond }));
            }
            CacheController.storeCache(uniqueID, { jsonCache: [{ BondsJSON, received, time: new Date().toISOString() }], rawCache: {bonds},time: new Date().toISOString() })
            return socket.emit("bond::list", JSON.stringify(BondsJSON));
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    /**
     * Parser de Bonds
     * @param params {bond: StudentBond, courses?: CourseStudent[]}
     * @returns program, registration, courses
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