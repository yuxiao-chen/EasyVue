import { isFuntion } from "@vue/shared";
import { isTarcking, ReactiveEffect, trackEffects, triggerEffects } from "./effect";

class ComputedRefImpl {
    public dep = new Set()
    public _dirty = true
    public __v_isRef = true
    public effect
    public _value
    constructor(getter, public setter) {
        this.effect = new ReactiveEffect(
            getter,
            // 本 scheduler 函数用于触发读取到本 computed 的副作用函数， 
            // 如果对方再次读取本 computed，
            // 将触发本 computed 的 value 的触发，以触发getter
            () => {
                if (!this._dirty) {
                    this._dirty = true
                    triggerEffects(this.dep)
                }
            })
        // 标记该副作用是个计算函数，将优先触发
        this.effect.computed = this
    }

    get value() {
        if (isTarcking()) {
            trackEffects(this.dep)
        }
        if (this._dirty) {
            // 将执行 getter
            this._value = this.effect.run()
            this._dirty = false
        }
        return this._value
    }

    set value(v) {
        this.setter(v)
    }
}

export function computed(getterOrOptions) {
    const onlyGetter = isFuntion(getterOrOptions)

    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions
        setter = () => { }
    } else {
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }

    return new ComputedRefImpl(getter, setter)
}

