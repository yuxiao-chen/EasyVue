export function isObject(value: unknown): value is Record<any, any> {
    return typeof value === 'object' && value !== null
}

export function isFuntion(v: unknown): boolean {
    return typeof v === 'function'
}