import NodeCache from "node-cache";

interface ICacheService<T> {
    get(key: string): T;
    set<T>(key: string, value: T): boolean;
}
class CacheService<T> implements ICacheService<T> {
	private cache: NodeCache;
	constructor(options: NodeCache.Options = { stdTTL: 5400 }) {
		this.cache = new NodeCache(options);
	}

	get<T>(key: string): T {
		return this.cache.get(key);
	}

	set<T>(key: string, value: T): boolean {
		return this.cache.set(key, value);
	}
	has(key: string) {
		return this.cache.has(key);
	}
	delete(key: string) {
		return this.cache.del(key);
	}
	/**
	 * merge as propriedades profundas de um objeto
	 */

	merge(key: string, value: Partial<T>) {
		const current = this.get<T>(key);
		if (!current) {
			this.set(key, value);
			return;
		}
		const merged = this.mergeDeep(current, value);
		this.set(key, merged);
	}

	mergeDeep(target: T, source: Partial<T>) {
		const isObject = (obj: unknown) => obj && typeof obj === "object";

		if (!isObject(target) || !isObject(source)) {
			return source;
		}

		Object.keys(source).forEach((key) => {
			const targetValue = target[key];
			const sourceValue = source[key];

			if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
				target[key] = targetValue.concat(sourceValue);
			} else if (isObject(targetValue) && isObject(sourceValue)) {
				target[key] = this.mergeDeep(Object.assign({}, targetValue), sourceValue);
			} else {
				target[key] = sourceValue;
			}
		});

		return target;
	}
}

export default CacheService;