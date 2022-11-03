import { isObject, isString } from "@vue/shared"
import { ShapeFlags } from "@vue/shared"


export function createVnode(type, props, children = null) {
    const shapeFlag = isObject(type) ?
        ShapeFlags.COMPONENT :
        isString(type) ?
            ShapeFlags.ELEMENT
            :
            0
    const vnode = {
        _v_isVNode: true,
        type,
        shapeFlag,
        props,
        children,
        key: props && props.key,
        component: null, // 组件的 vnode 需要保存其组件实例
        el: null
    }

    if (children) {
        // 类型联合
        vnode.shapeFlag |= isString(children) ? ShapeFlags.TEXT_CHILDREN : ShapeFlags.ARRAY_CHILDREN
    }
    return vnode
}

export function isVNode(vnode) {
    return vnode?._v_isVNode
}

export const Text = Symbol()
export function normallizeVNode(vnode) {
    if (isObject(vnode)) {
        return vnode
    }
    return createVnode(Text, null, String(vnode))
}

export function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
}