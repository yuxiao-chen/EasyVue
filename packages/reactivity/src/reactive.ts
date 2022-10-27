import { isObject } from "@vue/shared"
import { track, trigget } from "./effect"

export const enum ReactiveFlags {
    SKIP = '__v_skip',
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
    IS_SHALLOW = '__v_isShallow',
    RAW = '__v_raw'
}

const mutableHandlers: ProxyHandler<Record<any, any>> = {
    get(target, key, recevier) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }

        // 触发依赖收集
        track(target, key)
        const res = Reflect.get(target, key, recevier)
        return res
    },
    set(targte, key, value, recevier) {
        const oldValue = (targte as any)[key]
        const res = Reflect.set(targte, key, value, recevier)
        if (oldValue !== value) {
            trigget(targte, key)
        }
        return res
    }
}

const reactiveMap = new WeakMap()

function createReactiveObject(target: object) {
    if (!isObject(target)) {
        return target
    }

    // 如果目标已经是 reactive 对象， 直接返回
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target
    }

    const existingProxy = reactiveMap.get(target);
    if (existingProxy) {
        return existingProxy
    }

    const proxy = new Proxy(target, mutableHandlers)
    reactiveMap.set(target, proxy)

    return proxy
}

export function reactive(target: object) {
    return createReactiveObject(target)
}