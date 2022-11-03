export const nodeOps = {
    // 插入 & 追加
    insert: (child, parent, anchor = null) => {
        console.log('insert', child, parent)
        parent.insertBefore(child, anchor)
    },
    remove: (child) => {
        const parent = child.parentNode
        parent && parent.removeChild(child)
    },
    createElement: (tag) => document.createElement(tag),
    createText: (text) => document.createTextNode(text),
    createComment: text => document .createComment(text),
    setElementText: (el, text) => el.textContent = text,
    setText: (node, text) => node.nodeValue = text,
    parentNode: (node) => node.parentNode,
    nextSibling: (node) => node.nextSibling,
    querySelector: (selector) => document.querySelector(selector)
}