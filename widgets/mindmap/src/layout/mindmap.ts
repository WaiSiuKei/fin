import { ILayout } from '../layout';
import { IConnector, ITopicViewNode } from '../topic';
import { IDimension, Justify } from '../common';
import { Vector } from '@fin/geometry';

export function getHorizionalSpacingOfChildren(tier: number) {
  if (tier === 0) {
    return 40;
  }
  return 40;
}

export function getVerticalSpacingOfChildren(tier: number) {
  if (tier === 0) {
    return 20;
  }
  if (tier === 1) {
    return 10;
  }
  return 5;
}

export class MindmapLayout implements ILayout {

  private widths: Map<ITopicViewNode, number> = new Map<ITopicViewNode, number>();
  private heightOfSubtree: Map<ITopicViewNode, number> = new Map<ITopicViewNode, number>();
  private heightOfBlock: Map<ITopicViewNode, number> = new Map<ITopicViewNode, number>();

  private heightOfLeftTree: number;
  private heightOfRightTree: number;

  private leftTree: ITopicViewNode[] = [];
  private rightTree: ITopicViewNode[] = [];

  constructor(public dimension: IDimension) {
  }

  _layout(node: ITopicViewNode, children: ITopicViewNode[], justify: Justify, specifiedHeight?: number) {
    let len = children.length;
    if (!len) return;

    let spaceLeft = getHorizionalSpacingOfChildren(node.tier);

    let nextOrigin = node.origin;
    if (justify === Justify.Left) {
      nextOrigin = Vector.add(node.origin, { x: node.getWidth() + spaceLeft, y: 0 });
    } else {
      nextOrigin = Vector.subtract(node.origin, { x: node.getWidth() + spaceLeft, y: 0 });
    }

    if (children.length === 1) {
      let topic = children[0];
      topic.translate(justify === Justify.Right ? -topic.getWidth() : 0, -topic.getHeight() / 2, Vector.add(nextOrigin, { x: 0, y: 0 }));
    } else {
      let spaceV = getVerticalSpacingOfChildren(node.tier);
      let top = -(specifiedHeight || this.heightOfSubtree.get(node)) / 2;
      for (let i = 0; i < len; i++) {
        let topic = children[i];
        let h = this.heightOfBlock.get(topic);
        top += h / 2;
        topic.translate(justify === Justify.Right ? -topic.getWidth() : 0, -topic.getHeight() / 2, Vector.add(nextOrigin, { x: 0, y: top }));
        top += h / 2;
        top += spaceV;
      }
    }
  }

  isBelongToTree(node: ITopicViewNode, nodes: ITopicViewNode[]) {
    if (!node.parent) return false;
    if (!nodes.length) return false;
    let p = node;
    let prevP = node;
    while (p.parent) {
      prevP = p;
      p = p.parent;
    }
    return nodes.indexOf(prevP) > -1;
  }

  layoutSubTree(rootNode: ITopicViewNode, tree: ITopicViewNode[], justify: Justify): ITopicViewNode[] {
    if (!tree.length) return [];
    this._layout(rootNode, tree, justify, justify === Justify.Right ? this.heightOfLeftTree : this.heightOfRightTree);

    let nodes = tree.slice();
    let current: ITopicViewNode;
    let mutated: ITopicViewNode[] = tree.slice();
    while (current = nodes.shift()) {
      this._layout(current, current.children, justify);
      mutated.push(current);
      current.justify = justify;
      nodes = nodes.concat(current.children);
    }
    return mutated;
  }

  layout(node: ITopicViewNode): ITopicViewNode[] {
    this._measure(node);

    // find root
    let p = node;
    while (p.parent) {
      p = p.parent;
    }


    let len = p.children.length;
    if (len < 4) {
      this.leftTree.length = 0;
      this.rightTree = p.children.slice();
    } else {
      let mid = Math.floor(len / 2);
      this.rightTree = p.children.slice(0, mid);
      this.leftTree = p.children.slice(mid);
    }

    this.heightOfLeftTree = this.leftTree.length ? this.leftTree.reduce((acc, t) => {
      return acc + this.heightOfBlock.get(t);
    }, (this.leftTree.length - 1) * getVerticalSpacingOfChildren(0)) : 0;

    this.heightOfRightTree = this.rightTree.length ? this.rightTree.reduce((acc, t) => {
      return acc + this.heightOfBlock.get(t);
    }, (this.rightTree.length - 1) * getVerticalSpacingOfChildren(0)) : 0;

    p.translate(-p.getWidth() / 2, -p.getHeight() / 2, { x: this.dimension.width / 2, y: this.dimension.height / 2 });

    return this.layoutSubTree(p, this.leftTree, Justify.Right).concat(this.layoutSubTree(p, this.rightTree, Justify.Left)).concat(p);
  }

  layoutConnectors(connectors: IConnector[]): void {
    for (let c of connectors) {
      let { x: x1, y: y1 } = c.from.origin;
      let { x: x2, y: y2 } = c.to.origin;

      if (c.from.parent) {
        if (this.isBelongToTree(c.from, this.rightTree)) {
          x1 += c.from.getWidth() + 25;
        } else {
          x1 -= c.from.getWidth() + 25;
        }
      }

      let cpx2: number;
      let dx = Math.abs(x1 - x2) * 0.3;
      if (x1 < x2) {
        cpx2 = x1 + dx;
      } else if (x1 > x2) {
        cpx2 = x1 - dx;
      } else {
        cpx2 = x1;
      }

      let cpy1: number;
      let dy = Math.abs(y1 - y2) * 0.3;
      if (y1 < y2) {
        cpy1 = y1 + dy;
      } else if (y1 > y2) {
        cpy1 = y1 - dy;
      } else {
        cpy1 = y1;
      }

      c.clear();
      c.moveTo(x1, y1);
      c.bezierTo(x1, cpy1, cpx2, y2, x2, y2);
      c.done();
    }
  }

  _measure(node: ITopicViewNode) {
    let p = node;
    while (p) {
      this._getHeight(p);
      p = p.parent;
    }
  }

  _getHeight(node: ITopicViewNode) {
    let h = 0;
    if (node.children.length) {
      let tier = node.tier;
      h = node.children.reduce((acc, t) => {
        return acc + this.heightOfBlock.get(t);
      }, (node.children.length - 1) * getVerticalSpacingOfChildren(tier));
    }
    this.heightOfSubtree.set(node, h);
    this.heightOfBlock.set(node, Math.max(h, node.getHeight()));
  }

  clear(mutated: ITopicViewNode) {
    if (!mutated.parent) {
      this.widths.clear();
      this.heightOfBlock.clear();
      this.heightOfSubtree.clear();
    } else {
      let nodes = [mutated];
      let current;
      while (current = nodes.pop()) {
        this.widths.delete(current);
        this.heightOfBlock.delete(current);
        this.heightOfSubtree.delete(current);
        nodes.push(...current.children);
      }
    }
  }
}
