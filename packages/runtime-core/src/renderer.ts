import { ShapeFlags } from '@vue/shared'
import { ReactiveEffect } from 'packages/reactivity/src/effect'
import { createAppAPI } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
import { isSameVNodeType, normallizeVNode, Text } from './vnode'

export function createRenderer(renderOptions) {
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        // createComment: hostCreateComment,
        // setText: hostSetText,
        setElementText: hostSetElementText,
        // parentNode: hostParentNode,
        // nextSibling: hostNextSibling,
    } = renderOptions

    const setupRenderEffect = (initialVNode, instance, container) => {
        const componentUpdateFn = () => {
            let { proxy } = instance
            if (!instance.isMounted) {
                // render 将触发 响应式对象的依赖收集
                const subtree = instance.subTree = instance.render.call(proxy, proxy)
                console.log('subtree', initialVNode.shapeFlag, instance.render, subtree)
                patch(null, subtree, container)
                initialVNode.el = subtree.el
                instance.isMounted = true
            } else {
                const prevTree = instance.subTree
                const nextTree = instance.render.call(proxy, proxy)

                console.log('update', nextTree)
                patch(prevTree, nextTree, container)
            }
        }
        const effect = new ReactiveEffect(componentUpdateFn)
        const update = effect.run.bind(effect)
        update()

    }

    const mountComponent = (initialVNode, container) => {
        console.log('mountComponent', initialVNode.shapeFlag)
        // 1. 实例创建
        const instance = initialVNode.component = createComponentInstance(initialVNode)
        // 2. 启动组件（实例属性赋值）
        setupComponent(instance)
        // 3. render
        console.log('after init ins', initialVNode.shapeFlag)
        console.log('instance', instance)
        setupRenderEffect(initialVNode, instance, container)

    }

    const processComponent = (n1, n2, container) => {
        // 没有旧组件 => 初始化; 否则更新; 
        if (n1 === null) {
            mountComponent(n2, container)
        } else {
            // 更新
        }
    }

    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            const child = children[i] = normallizeVNode(children[i]);
            console.log('child', child)
            patch(null, child, container)
        }
    }

    const mountElement = (vnode, container) => {
        console.log('mountElement', vnode, container)
        const { type, props, shapeFlag, children } = vnode
        const el = vnode.el = hostCreateElement(type)
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children)
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el)
        }

        console.log('props', props)

        if (props) {
            for (const key in props) {
                console.log('key', key)
                hostPatchProp(el, key, null, props[key])
            }
        }

        hostInsert(el, container)
    }
    const patchProps = (oldProps, newProps, el) => {
        if (oldProps === newProps) return
        // 新属性值设置
        for (const key in newProps) {
            const prev = oldProps[key]
            const next = newProps[key]
            if (prev !== next) {
                hostPatchProp(el, key, prev, next)
            }
        }

        // 移除新属性中不存在的老属性
        for (const key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null)
            }
        }

    }
    const patchElement = (n1, n2) => {
        let el = n2.el = n1.el
        const oldProps = n1.props || {}
        const newProps = n2.props || {}

        // 比较属性
        patchProps(oldProps, newProps, el)
    }

    const processElement = (n1, n2, container) => {
        if (n1 == null) {
            // init
            mountElement(n2, container)
        } else {
            // update
            patchElement(n1, n2)
        }
    }

    const processText = (n1, n2, conatiner) => {
        if (n1 === null) {
            let textNode = n2.el = hostCreateText(n2.children)
            console.log('processText', n2, conatiner)
            hostInsert(textNode, conatiner)
        } else {

        }
    }

    const unmount = (vnode) => {
        console.log('vnode', vnode)
        hostRemove(vnode.el)
    }

    const patch = (n1, n2, container) => {
        if (n1 && !isSameVNodeType(n1, n2)) {
            unmount(n1)
            n1 = null
        }

        if (n1 == n2) return

        const { shapeFlag, type } = n2
        switch (type) {
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.COMPONENT) {
                    processComponent(n1, n2, container)
                } else if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container)
                }
                break;
        }

    }
    const render = (vnode, container) => {
        patch(null, vnode, container)

    }
    return {
        render,
        createApp: createAppAPI(render)
    }
}