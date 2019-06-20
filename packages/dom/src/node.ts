export enum NodeType {
  ELEMENT_NODE = 1,
  /* deprected */
  ATTRIBUTE_NODE = 2,
  TEXT_NODE = 3,
  CDATA_SECTION_NODE = 4,
  /* deprected */
  ENTITY_REFERENCE_NODE = 5,
  /* deprected */
  ENTITY_NODE = 6,
  PROCESSING_INSTRUCTION_NODE = 7,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  DOCUMENT_FRAGMENT_NODE = 11,
  /* deprected */
  NOTATION_NODE = 12
}

export function saveParentsScrollTop(node: Element): number[] {
  let r: number[] = [];
  for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
    r[i] = node.scrollTop;
    node = <Element>node.parentNode;
  }
  return r;
}

export function restoreParentsScrollTop(node: Element, state: number[]): void {
  for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
    if (node.scrollTop !== state[i]) {
      node.scrollTop = state[i];
    }
    node = <Element>node.parentNode;
  }
}
