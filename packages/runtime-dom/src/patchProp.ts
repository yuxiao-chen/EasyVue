import { isOn } from "@vue/shared"

function patchClass(el, value) {
    if (value == null) {
        el.removeAttribute('class')
    } else {
        el.class = value
    }
}

function patchStyle(el, prev, next) {
    const style = el.style
    for (const key in next) {
        style[key] = next[key]
    }
    if (prev) {
        for (const key in prev) {
            // 移除 被移除的旧样式
            if (next[key] == null) {
                style[key] = null
            }
        }
    }
}

// 创建一个事件调用函数，将真实的事件响应函数作为其 value 属性
// 如果后续需要换绑，只需要改变其value属性
// 处理换绑操作， 减少原生事件换绑操作(removeEventListener 再 addEventListener)
function createInvoker(value) {
    const invoker = (e) => {
        invoker.value(e)
    }
    invoker.value = value
    return invoker
}

function patchEvent(el, key, nextValue) {
    // 记录已绑定事件
    const invokers = el._evi || (el._evi = {})

    const existingInvoker = invokers[key]
    // 如果记录过该事件响应函数 且需要换绑， 直接替换调度函数的value
    if (existingInvoker && nextValue) {
        existingInvoker.value = nextValue
    } else {
        const name = key.slice(2).toLowerCase()
        // 未记录过 -> 新绑定
        if (nextValue) {
            const invoker = invokers[key] = createInvoker(nextValue)
            el.addEventListener(name, invoker)
            // 没有 nextValue 但记录过绑定事件， 视为解除绑定
        } else if (existingInvoker) {
            el.removeEventListener(name, existingInvoker)
            invokers[key] = undefined
        }
    }
}

function patchAttr(el, key, value) {
    if (value === null) {
        el.removeAttribute(key)
    } else {
        el.setAttribute(key, value)
    }
}

export const patchProp = (el, key, prevValue, nextValue) => {
    if (key === 'class') {
        patchClass(el, nextValue)
    } else if (key === 'style') {
        patchStyle(el, prevValue, nextValue)
    } else if (isOn(key)) {
        patchEvent(el, key, nextValue)
    } else {
        patchAttr(el, key, nextValue)
    }
}