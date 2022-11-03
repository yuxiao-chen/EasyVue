// | => 两个二进制数，同位数比较生成新的二进制数（同位中一方为1则记1，否则记0）
// & => 两个二进制数，同位数比较生成新的二进制数（同位中双方为1则记1，否则记0）

// 以下 enum 在不同的二进制位上打标记，用以表示不同类型的节点类型， 
// 后续可用 "|"  符做联合类型，更详细的描述一个节点， 
//  如: 子节点是文本的元素组件 => ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN => 01 | 1000 => 1001
//  如果后续需要判断👆节点是否是元素节点，只需要 (1001 & ShapeFlags.ELEMENT) > 0 => true 即可
export const enum ShapeFlags {
   // 元素 01
  ELEMENT = 1,
  // 函数式组件 0010 
  FUNCTIONAL_COMPONENT = 1 << 1,
  // 普通组件 0100
  STATEFUL_COMPONENT = 1 << 2,
  // 子节点文本组件 1000
  TEXT_CHILDREN = 1 << 3,
  // 数组子节点组件 010000
  ARRAY_CHILDREN = 1 << 4,
  // slot子节点 100000
  SLOTS_CHILDREN = 1 << 5,
  // teleport 组件 01000000
  TELEPORT = 1 << 6,
  // suspense 组件 10000000
  SUSPENSE = 1 << 7,
  //  010000000
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  // keep-alive 组件
  COMPONENT_KEPT_ALIVE = 1 << 9,
  // 0010 | 0001 => 0011
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
