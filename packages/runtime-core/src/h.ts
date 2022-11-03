import { isArray, isObject } from "@vue/shared"
import { createVnode, isVNode } from "./vnode"


/**
 * 处理 createVNode 的多种使用场景
 */
export function h(type, propsOrChildren, children) {
    const l = arguments.length
    if (l == 2) {
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            // 没有 props 单 child
            if (isVNode(propsOrChildren)) {
                return createVnode(type, null, [propsOrChildren])
            }
            // 没有child的场景
            return createVnode(type, propsOrChildren)
        } else {
            // 没有 props 多 child
            return createVnode(type, null, propsOrChildren)
        }
    } else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2)
        } else if (l === 3 && isVNode(children)) {
            children = [children]
        }
        return createVnode(type, propsOrChildren, children)
    }
}