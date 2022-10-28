import { isTarcking, trackEffects, triggerEffects } from "./effect"
import { toReactive } from "./reactive"

class RefImpl {
    public dep
    public __v_isRef
    public _value
    constructor(public _rawValue) {
        // 如果是对象，转 reactive
        this._value = toReactive(_rawValue)
    }
    get value() {
        if (isTarcking()) {
            trackEffects(this.dep || (this.dep = new Set()))
        }
        return this._value
    }
    set value(newValue) {
        if (newValue !== this._rawValue) {
            this._rawValue = newValue
            this._value = toReactive(newValue)
            triggerEffects(this.dep)
        }
    }
}

export function createRef(value) {
    return new RefImpl(value)
}

export function ref(value) {
    return createRef(value)
}