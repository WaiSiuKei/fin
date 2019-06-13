import { ILayout } from '../layout';
import { IConnector, ITopicViewNode } from '../topic';
import { IDimension, Justify } from '../common';
import { Vector } from '@fin/geometry';

export function getHorizionalSpacingOfChildren(tier: number) {
  if (tier === 0) {
    return 100;
  }
  return 50;
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

  public widths: Map<ITopicViewNode, number> = new Map<ITopicViewNode, number>();
  public heights: Map<ITopicViewNode, number> = new Map<ITopicViewNode, number>();

  constructor(public dimension: IDimension) {
  }

  _layout(node: ITopicViewNode) {
    let len = node.children.length;
    if (!len) return;
    let spaceLeft = getHorizionalSpacingOfChildren(node.tier);

    let nextOrigin = node.origin;
    if (node.justify === Justify.Left) {
      nextOrigin = Vector.add(node.origin, { x: node.getWidth(), y: 0 });
    }

    if (node.children.length === 1) {
      let topic = node.children[0];
      topic.translate(0, -topic.getHeight() / 2, Vector.add(nextOrigin, { x: spaceLeft, y: 0 }));
    } else {
      let spaceV = getVerticalSpacingOfChildren(node.tier);
      let top = -this.heights.get(node) / 2;
      for (let i = 0; i < len; i++) {
        let topic = node.children[i];
        let h = this.heights.get(topic);
        top += h / 2;
        topic.translate(0, -topic.getHeight() / 2, Vector.add(nextOrigin, { x: spaceLeft, y: top }));
        top += h / 2;
        top += spaceV;
      }
    }
  }

  layout(node: ITopicViewNode): ITopicViewNode[] {
    // find root
    let p = node;
    while (p.parent) {
      p = p.parent;
    }

    p.translate(-p.getWidth() / 2, -p.getHeight() / 2, { x: this.dimension.width / 2, y: this.dimension.height / 2 });

    let nodes = [p];
    let current;
    let mutated = [];
    while (current = nodes.shift()) {
      this._layout(current);
      mutated.push(current);
      nodes = nodes.concat(current.children);
    }
    return mutated;
  }

  layoutConnectors(connectors: IConnector[]): void {
    for (let c of connectors) {
      let { x: x1, y: y1 } = c.from.origin;
      let { x: x2, y: y2 } = c.to.origin;

      if (c.from.justify !== Justify.Middle) {
        x1 += c.from.getWidth() + 25;
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

  measure(viewNode: ITopicViewNode): ITopicViewNode[] {
    let node: ITopicViewNode = viewNode;
    let mutated = [node];
    while (node) {
      let h = this._getDeepHeight(node);
      this.heights.set(node, h);
      node = node.parent;
      mutated.push(node);
    }
    return mutated;
  }

  _getDeepHeight(node: ITopicViewNode): number {
    let tier = node.tier;
    let deepHeight = node.children.length ? node.children.reduce((acc, t) => {
      return acc + this._getDeepHeight(t);
    }, (node.children.length - 1) * getVerticalSpacingOfChildren(tier)) : node.getHeight();
    return deepHeight;
  }
}
