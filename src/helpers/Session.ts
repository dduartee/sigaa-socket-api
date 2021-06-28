import { cacheService } from "../services/cacheService";

class SessionHelper {
    /**
     * Cria sessão para o socket com UniqueID
     * @param sid string
     * @param uniqueID string
     * @returns 
     */
    create(sid: string, uniqueID: string) {
        cacheService.set(sid, uniqueID)
        return cacheService.set(uniqueID, {})
    }
    read(sid: string): any {
        return cacheService.get(sid)
    }
    /**
     * Atualiza sessão pelo uniqueID
     * @param sid string
     * @param uniqueID string
     * @returns 
     */
    update(sid: string, uniqueID: string) {
        this.delete(sid);
        return cacheService.set(sid, uniqueID)

    }
    delete(sid: string) {
        return cacheService.del(sid);
    }
}

export const session = new SessionHelper()