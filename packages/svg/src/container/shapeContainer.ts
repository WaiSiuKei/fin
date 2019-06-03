import { Container } from './container';
import { Shape } from '../shape/shape';

export class ShapeContainer extends Container<Shape> {

  /* public */
  addShape(shape: Shape, index: number = 0) {
    return this.addItem(shape, index);
  }

  put(shape: Shape) {
    this.addShape(shape);
    return shape;
  }

  appendShape(shape: Shape) {
    return this.addShape(shape);
  }

  prependShape(shape: Shape) {
    return this.addShape(shape, 0);
  }

  replaceShape(replacer: Shape, origin: Shape) {
    var index = this.indexOf(origin);
    if (index === -1) {
      return;
    }
    this.removeShape(index);
    this.addShape(replacer, index);
    return this;
  }

  addShapeBefore(shape: Shape, refer: Shape) {
    var index = this.indexOf(refer);
    return this.addShape(shape, index);
  }

  addShapeAfter(shape: Shape, refer: Shape) {
    var index = this.indexOf(refer);
    return this.addShape(shape, index === -1 ? undefined : index + 1);
  }

  /* public */
  addShapes(shapes: Shape[]) {
    return this.addItems(shapes);
  }

  /* public */
  removeShape(index: number) {
    return this.removeItem(index);
  }

  getShapes(): Shape[] {
    return this.getItems();
  }
}
