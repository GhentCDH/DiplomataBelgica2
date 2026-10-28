/**
 * Tradition records (originals, copies, manuscripts) live in one index and their
 * numeric ids overlap between types, so they are identified by a "type:id" key.
 */
export interface TraditionRef {
    type: string,
    id: string,
}

/** Parse "type:id"; a bare id is an original (old bookmarks and stored search contexts). */
export function parseTraditionKey(key: string | number): TraditionRef {
    const [type, id] = String(key).includes(':') ? String(key).split(':', 2) : ['original', String(key)]
    return {type, id}
}

/** Key of the record shown on a detail page path like /fr/tradition/manuscript/104. */
export function traditionKeyFromPath(pathname: string): string {
    const segments = pathname.split('/').filter(Boolean)
    return segments.slice(-2).join(':')
}

/** Detail page path with its type and id replaced by those of `key`. */
export function replaceTraditionInPath(pathname: string, key: string): string {
    const {type, id} = parseTraditionKey(key)
    return pathname.replace(/\/tradition\/[^/]+\/[^/]+$/, `/tradition/${type}/${id}`)
}
