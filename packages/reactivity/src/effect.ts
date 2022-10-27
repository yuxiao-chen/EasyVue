let effectStack = []
let activeEffect;

function clearupEffect(effect) {
    const deps = effect.deps
    for (const dep of deps) {
        dep.delete(effect)
    }
    deps.length = 0
}

export class ReactiveEffect {
    active = true
    deps = []
    computed?
    constructor(public fn, public scheduler?) { }
    run() {
        if (!this.active) {
            return this.fn()
        }
        if (!effectStack.includes(this)) {
            try {
                effectStack.push(activeEffect = this)
                return this.fn()
            } finally {
                effectStack.pop()
                activeEffect = effectStack[effectStack.length - 1]
            }
        }
    }
    stop() {
        if (this.active) {
            clearupEffect(this)
            this.active = false
        }
    }
}

export function isTarcking() {
    return activeEffect !== undefined
}

/**
 * {  // => targetMap
 *  [key: ReactiveObject]: { // => target: Map
 *      [key: key in ReactiveObject] : Effect[] // key = Set activeEffect
 *  }
 * }
 */
// 属性 key 和 其相关副作用 effect 对应关系为 多对多
const targetMap = new WeakMap()
// @ts-ignore
window.targetMap = targetMap
export function track(target, key) {
    if (!isTarcking()) return

    // 将 目标 proxy 对象收集到 targetMap
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, depsMap = new Map())
    }

    // 为 目标 proxy 的 key 建立 Set 对象来收集对应的副作用 effect ；
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, dep = new Set())
    }

    trackEffects(dep)
}


export function trackEffects(dep) {
    // 如果存在该副作用 effect 就不重复收集了
    let shouldTrack = !dep.has(activeEffect)
    if (shouldTrack) {
        dep.add(activeEffect)
        activeEffect.deps.push(dep)
    }
}

export function trigget(target, key) {
    let depsMap = targetMap.get(target)
    if (!depsMap) return

    let deps = []
    if (typeof key !== 'undefined') {
        deps.push(depsMap.get(key))
    }
    let effects = []
    for (const dep of deps) {
        effects.push(...dep)
    }
    triggerEffects(effects)
}

export function triggerEffects(effects) {
    for (const effect of effects) {
        if (effect.computed) {
            triggerEffect(effect)
        }
    }
    for (const effect of effects) {
        if (!effect.computed) {
            triggerEffect(effect)
        }
    }
}
function triggerEffect(effect) {
    // 如果当前 effect 不等于当前激活的 effect， 则执行
    if (effect !== activeEffect) {
        if (effect.scheduler) {
            return effect.scheduler()
        }
        effect.run()
    }
}


export function effect(fn) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()

    let runner = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

