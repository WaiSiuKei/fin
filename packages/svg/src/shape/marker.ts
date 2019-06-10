import { ShapeContainer } from '../container/shapeContainer';
import { createNode, Paper } from '../container/paper';
import { Vector } from '@fin/geometry';

export class Marker extends ShapeContainer {
  node: SVGElement;

  constructor(tagName: string, paper?: Paper) {
    super();

    this.node = createNode(tagName);
    if (paper) {
      paper.addResource(this);
    }
    this.setOrient('auto');
  }

  setRef(x: number, y: number) {
    this.node.setAttribute('refX', x.toString());
    this.node.setAttribute('refY', y.toString());
    return this;
  }

  getRef() {
    return new Vector({
      x: +this.node.getAttribute('refX'),
      y: +this.node.getAttribute('refY')
    });
  }

  width: number;
  setWidth(width: number) {
    this.width = width;
    this.node.setAttribute('markerWidth', width.toString());
    return this;
  }

  orient: string;
  setOrient(orient: string) {
    this.node.setAttribute('orient', this.orient = orient);
    return this;
  }

  getOrient() {
    return this.orient;
  }

  getWidth() {
    return +this.width;
  }

  height: number;
  setHeight(height: number) {
    this.height = height;
    this.node.setAttribute('markerHeight', height.toString());
    return this;
  }

  getHeight() {
    return +this.height;
  }

  translate(x: number, y: number) {

  }
}
