import { cacheService } from "../services/cacheService";

class Session {
    create(sid: string, uniqueID: string) {
        cacheService.set(sid, uniqueID)
        return cacheService.set(uniqueID, {})
    }
    read(sid: string): any {
        return cacheService.get(sid)
    }
    update(sid: string, uniqueID: string) {
        this.delete(sid);
        return cacheService.set(sid, uniqueID)

    }
    delete(sid: string) {
        return cacheService.del(sid);
    }
}

export const session = new Session()