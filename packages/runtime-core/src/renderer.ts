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

    const mountChildren = (children, container, anchor) => {
        for (let i = 0; i < children.length; i++) {
            const child = children[i] = normallizeVNode(children[i]);
            console.log('child', child)
            patch(null, child, container, anchor)
        }
    }

    const mountElement = (vnode, container, anchor) => {
        console.log('mountElement', vnode, container)
        const { type, props, shapeFlag, children } = vnode
        const el = vnode.el = hostCreateElement(type)
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children)
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, anchor)
        }

        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key])
            }
        }

        hostInsert(el, container, anchor)
    }

    const unmountChildren = (children) => {
        for (let i = 0; i < children.length; i++) {
            unmount(children[i])
        }
    }

    const patchKeyedChildren = (c1, c2, container) => {
        console.log('patchKeyedChildren', c1, c2)
        let e1 = c1.length - 1
        let e2 = c2.length - 1
        let i = 0

        // 1. sync from start
        // (a b c)
        // (a b c) d
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            // 节点相同 则递归比较子集
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null)
            } else {
                break
            }
            console.log(i++)
            i++
        }
        console.log('i', i)

        // 2. sync from end
        // a (b c)
        // d e (b c)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            // 节点相同 则递归比较子集
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null)
            } else {
                console.log('break e1-2 --')
                break
            }
            e1--
            e2--
        }
        console.log(`i = ${i}, el = ${e1}, e2 = ${e2}`)

        // 3. common sequence + mount
        // (a b) 
        // (a b) c
        // i > e1 => 需要新增元素，i 到 e2 间元素需要新增
        if (i > e1) {
            if (i <= e2) {
                // 需要新增元素的下一个元素位置
                const nextPos = e2 + 1
                // 如果下一个元素位置没有超出新元素的边界，
                // 则将该元素位置作为需要插入新元素的锚点，在锚点前插入新元素
                // 否则不设置锚点，直接在容器尾部添加
                const anchor = nextPos < c2.length ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, anchor)
                    i++
                }
            }

        }

        // 4. common sequence + unmount
        // (a b) c
        // (a b)
        // a (b c) 
        //   (b c)
        // i > e2 => 旧子元素比新子元素多， 需要删除 i 到 e1 间的元素
        else if (i > e2) {
            while (i <= e1) {
                unmount(c1[i])
                i++
            }
        }

        // 5. unkone sequence

    }

    const patchChildren = (n1, n2, container, anchor) => {
        const c1 = n1 && n1.children
        const c2 = n2 && n2.children
        const prevShapeFlag = n1.shapeFlag
        const shapeFlag = n2.shapeFlag

        /**
         * 子节点有3种情况， 数组、文本、没有子节点
         */
        // 新子节点是文本
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 旧子节点是数组， 新子节点是文本 => 删除旧子节点
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1)
            }
            // 更新文本
            if (c1 !== c2) {
                hostSetElementText(container, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // 新旧都是数组，全量diff
                    patchKeyedChildren(c1, c2, container)
                } else {
                    unmountChildren(c1)
                }
            } else {
                if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(container, '')
                }
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(c2, container, anchor)
                }
            }
        }

    }

    const patchProps = (oldProps, newProps, el) => {
        if (oldProps === newProps) return

        // 移除新节点中被删除的属性
        for (const key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null)
            }
        }

        // 新属性值设置
        for (const key in newProps) {
            const prev = oldProps[key]
            const next = newProps[key]
            if (prev !== next) {
                hostPatchProp(el, key, prev, next)
            }
        }

    }
    const patchElement = (n1, n2, anchor) => {
        let el = n2.el = n1.el
        const oldProps = n1.props || {}
        const newProps = n2.props || {}

        // 比较属性
        patchProps(oldProps, newProps, el)
        patchChildren(n1, n2, el, anchor)
    }

    const processElement = (n1, n2, container, anchor) => {
        if (n1 == null) {
            // init
            mountElement(n2, container, anchor)
        } else {
            // update
            patchElement(n1, n2, anchor)
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

    const patch = (n1, n2, container, anchor = null) => {
        // 新老节点不一致，卸载老节点
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
                    processElement(n1, n2, container, anchor)
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