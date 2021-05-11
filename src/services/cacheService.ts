
import NodeCache from 'node-cache';
export const cacheService = new NodeCache({ useClones: false });