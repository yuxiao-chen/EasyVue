import { reactive } from "@vue/reactivity"
import { hasOwn, isFuntion, isObject } from "@vue/shared"

export function createComponentInstance(vnode) {
    const type = vnode.type
    const instance = {
        vnode,
        type,
        subTree: null,
        ctx: {},
        props: {},
        attrs: {},
        slots: {},
        setupState: {},
        propsOptions: type.props,
        proxy: null,
        render: null,
        emit: null,
        exposed: {},
        isMounted: false
    }
    instance.ctx = { _: instance }
    return instance
}

export function initProps(instance, rawProps) {
    const props = {}
    const attrs = {}
    // 组件props中注册的属性
    const options = Object.keys(instance.propsOptions)
    if (rawProps) {
        for (const key in rawProps) {
            const value = rawProps[key]
            if (options.includes(key)) {
                props[key] = value
            } else {
                attrs[key] = value
            }
        }
    }
    // props 响应式（源码中位 shadowReactive）
    instance.props = reactive(props)
    instance.attrs = attrs
}

function createSetupContext(instance) {
    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: instance.emit,
        expose: (exposed) => instance.exposed = exposed || {}
    }
}

const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance
        if (hasOwn(setupState, key)) {
            return setupState[key]
        } else if (hasOwn(props, key)) {
            return props[key]
        } else {
            // ... 
        }
    },
    set({ _: instance }, key, value) {
        const { setupState, props } = instance

        if (hasOwn(setupState, key)) {
            setupState[key] = value 
        } else if (hasOwn(props, key)) {
            // warn ... 
            return false
        }

        return true
    }
}

export function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
    if (setup) {
        const cetupContent = createSetupContext(instance)
        const setupResult = setup(instance.props, cetupContent)
        if (isFuntion(setupResult)) {
            instance.render = setupResult
        } else if (isObject(setupResult)) {
            instance.setupState = setupResult
        }
    }

    if (!instance.render) {
        instance.render = Component.render
        // TODO: 如果没有render， compile 组件 temp
    }

}

export function setupComponent(instance) {
    const { props } = instance.vnode
    initProps(instance, props)
    // TODO: 初始化 slot => initSlot
    setupStatefulComponent(instance)
}
