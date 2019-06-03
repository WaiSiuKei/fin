import { Container } from './container';
import { Shape } from '../shape/shape';
import { Matrix, IVector } from '@fin/geometry';

function createNode(tagName) {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

function createSVGNode() {
  let node = createNode('svg');
  node.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  node.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  node.setAttribute('version', '1.1');
  return node;
}

export interface ViewPort {
  zoom: number
  center: IVector
  offset: IVector
}

export class Paper {
  node: SVGElement;
  resourceNode: SVGDefsElement;
  shapeNode: SVGGElement;
  resources: Container<Shape>;

  constructor(public container?: HTMLElement) {
    this.node = createSVGNode();

    this.node.appendChild(this.resourceNode = createNode('defs'));
    this.node.appendChild(this.shapeNode = createNode('g'));

    this.resources = new Container();
    this.setWidth('100%').setHeight('100%');

    if (this.container) {
      this.renderTo(container);
    }
  }

  renderTo(container: HTMLElement) {
    this.container = container;
    container.appendChild(this.node);
  }
  //#region width and height
  getWidth() {
    return this.node.clientWidth;
  }

  setWidth(width: number | string) {
    this.node.setAttribute('width', width.toString());
    return this;
  }

  getHeight() {
    return this.node.clientHeight;
  }

  setHeight(height: number | string) {
    this.node.setAttribute('height', height.toString());
    return this;
  }
  //#endregion

  //#region viewbox
  getViewBox() {
    let attr = this.node.getAttribute('viewBox');
    if (attr === null) {
      // firefox:
      // 1. viewBox 没有设置过的时候获得的是 null
      // 2. svg 标签没有指定绝对大小的时候 clientWidth 和 clientHeigt 为 0，需要在父容器上查找
      // TODO: 第 2 条取得的不准确（假如有 padding 之类的）
      return {
        x: 0,
        y: 0,
        width: this.node.clientWidth || this.node.parentElement.clientWidth,
        height: this.node.clientHeight || this.node.parentElement.clientHeight
      };
    } else {
      let [x, y, width, height] = attr.split(' ');
      return {
        x: +x,
        y: +y,
        width: +width,
        height: +height
      };
    }
  }

  setViewBox(x, y, width, height) {
    this.node.setAttribute('viewBox', [x, y, width, height].join(' '));
    return this;
  }
  //#endregion

  //#region viewport
  viewport: ViewPort;
  setViewPort(cx, cy, zoom) {
    let viewport, box;
    if (arguments.length == 1) {
      viewport = arguments[0];
      cx = viewport.center.x;
      cy = viewport.center.y;
      zoom = viewport.zoom;
    }
    zoom = zoom || 1;
    box = this.getViewBox();

    let matrix = new Matrix();
    let dx = (box.x + box.width / 2) - cx,
      dy = (box.y + box.height / 2) - cy;
    matrix.translate(-cx, -cy);
    matrix.scale(zoom);
    matrix.translate(cx, cy);
    matrix.translate(dx, dy);
    this.shapeNode.setAttribute('transform', 'matrix(' + matrix + ')');

    this.viewport = {
      center: {
        x: cx,
        y: cy
      },
      offset: {
        x: dx,
        y: dy
      },
      zoom: zoom
    };
    return this;
  }

  getViewPort() {
    if (!this.viewport) {
      let box = this.getViewBox();
      return {
        zoom: 1,
        center: {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2
        },
        offset: {
          x: 0,
          y: 0
        }
      };
    }
    return this.viewport;
  }

  getViewPortMatrix() {
    return Matrix.parse(this.shapeNode.getAttribute('transform'));
  }

  getViewPortTransform(): Matrix {
    let m = this.shapeNode.getCTM();
    return new Matrix(m);
  }

  getTransform() {
    return this.getViewPortTransform().reverse();
  }
  //#endregion

  //#region resource
  addResource(resource) {
    this.resources.appendItem(resource);

    if (resource.node) {
      this.resourceNode.appendChild(resource.node);
    }

    return this;
  }

  removeResource(resource) {
    if (resource.remove) {
      resource.remove();
    }
    if (resource.node) {
      this.resourceNode.removeChild(resource.node);
    }
    return this;
  }
  //@endregion
}
