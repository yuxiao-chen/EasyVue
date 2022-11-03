export * from './shapeFlags'

export function isObject(value: unknown): value is Record<any, any> {
    return typeof value === 'object' && value !== null
}

export const isArray = Array.isArray

export function isString(value: unknown): value is string {
    return typeof value === 'string' 
}

export function isFuntion(v: unknown):  v is Function {
    return typeof v === 'function'
}

const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)
