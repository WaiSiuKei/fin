import { Ellipse } from './ellipse';

export class Circle extends Ellipse {
  constructor(radius: number, cx: number, cy: number) {
    super(radius, radius, cx, cy);
  }

  getRadius() {
    return this.getRadiusX();
  }

  setRadius(radius: number) {
    this.rx = radius;
    this.ry = radius;
    this.update();
  }
}
