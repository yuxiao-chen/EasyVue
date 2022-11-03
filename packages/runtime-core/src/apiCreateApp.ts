import { createVnode } from "./vnode"

export function createAppAPI(render) {
    return (rootComponent, rootProps) => {
        console.log('rootProps', rootProps)
        let isMounted = false
        const app = {
            mount(container) {
                // 1. create vnode
                // 2. render
                if (!isMounted) {
                    const vnode = createVnode(rootComponent, rootProps)
                    isMounted = true
                    render(vnode, container)
                }
            },
            use() {/** ... */ },
            mixin() {/** ... */ },
            component() {/** ... */ },
            directive() {/** ... */ },
            unmount() {/** ... */ },
            provide() {/** ... */ }
        }
        return app
    }
}