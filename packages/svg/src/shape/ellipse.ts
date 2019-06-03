import { Path } from './path';
import { Vector } from '@fin/geometry';

export class Ellipse extends Path {
  rx: number;
  ry: number;
  cx: number;
  cy: number;
  constructor(rx = 0, ry = 0, cx = 0, cy = 0) {
    super();
    this.rx = rx;
    this.ry = ry;
    this.cx = cx;
    this.cy = cy;
    this.update();
  }

  update() {
    var rx = this.rx,
      ry = this.ry,
      x1 = this.cx + rx,
      x2 = this.cx - rx,
      y = this.cy;
    this.clear();
    this.moveTo(x1, y);
    this.arcTo(rx, ry, 0, 1, 1, x2, y);
    this.arcTo(rx, ry, 0, 1, 1, x1, y);
    return this;
  }

  getRadius() {
    return {
      x: this.rx,
      y: this.ry
    };
  }

  getRadiusX() {
    return this.rx;
  }

  getRadiusY() {
    return this.ry;
  }

  getCenter() {
    return new Vector({
      x: this.cx,
      y: this.cy
    });
  }

  getCenterX() {
    return this.cx;
  }

  getCenterY() {
    return this.cy;
  }

  setRadius(rx, ry) {
    this.rx = rx;
    this.ry = ry;
    return this.update();
  }

  setRadiusX(rx) {
    this.rx = rx;
    return this.update();
  }

  setRadiusY(ry) {
    this.ry = ry;
    return this.update();
  }

  setCenter(cx, cy) {
    this.cx = cx;
    this.cy = cy;
    return this.update();
  }

  setCenterX(cx) {
    this.cx = cx;
    return this.update();
  }

  setCenterY(cy) {
    this.cy = cy;
    return this.update();
  }
}
