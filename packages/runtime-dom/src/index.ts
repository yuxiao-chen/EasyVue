import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOpts";
import { patchProp } from "./patchProp";

const renderOptions = Object.assign({ patchProp }, nodeOps)
// console.log(renderOptions)




export const createApp = (component, rootProps = null) => {
    const { createApp } = createRenderer(renderOptions)
    const app = createApp(component, rootProps)
    let { mount } = app
    app.mount = function (container) {
        mount(container)
    }  
    return app
}



export * from '@vue/runtime-core'
