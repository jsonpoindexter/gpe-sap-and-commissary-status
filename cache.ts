namespace Cache {
    export function read<T>(key: string): T | null {
        const cache = CacheService.getScriptCache().get(key)
        return cache ? JSON.parse(cache) as T : null
    }

    export function write<T>(key: string, value: T, ttl = Constants.CACHE_TTL): void {
        CacheService.getScriptCache().put(key, JSON.stringify(value), ttl)
    }
}