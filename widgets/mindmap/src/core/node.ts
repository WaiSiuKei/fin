import { isObject, isString } from '@fin/types';

export class MindmapNode {
  _parent: MindmapNode;
  _root: MindmapNode;
  _data: object;
  _children: MindmapNode[] = [];
  _label: string;
  constructor(data: string | object) {
    if (isString(data)) {
      this._label = data;
    }
    if (isObject(data)) {
      this._data = data as object;
    }
  }

  /**
   * 判断节点是否根节点
   */
  isRoot() {
    return this._root === this;
  }

  /**
   * 判断节点是否叶子
   */
  isLeaf() {
    return this._children.length === 0;
  }

  /**
   * 获取节点的根节点
   */
  get root() {
    return this._root || this;
  }

  /**
   * 获得节点的父节点
   */
  get parent() {
    return this._parent;
  }

  getSiblings() {
    return this._parent.children.filter(s => s !== this);
  }

  /**
   * 获得节点的深度
   */
  get level() {
    var level = 0,
      ancestor = this.parent;
    while (ancestor) {
      level++;
      ancestor = ancestor.parent;
    }
    return level;
  }

  isAncestorOf(test: MindmapNode) {
    var ancestor = test.parent;
    while (ancestor) {
      if (ancestor === this) return true;
      ancestor = ancestor.parent;
    }
    return false;
  }

  get children() {
    return this._children;
  }

  get index() {
    return this.parent ? this.parent.children.indexOf(this) : -1;
  }
}
