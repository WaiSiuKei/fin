import { Paper, Path } from '@fin/svg';
import { Topic } from './topic';
import { Justify } from '../common';

export class Connector extends Path {
  constructor(private from: Topic, private to: Topic) {
    super();
  }

  mountTo(group: SVGGElement) {
    group.appendChild(this.node);
  }

  render() {
    let { x: x1, y: y1 } = this.from.origin;
    let { x: x2, y: y2 } = this.to.origin;

    if (this.from.justify !== Justify.Middle) {
      x1 += this.from.getWidth() + 25;
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

    this.clear();
    this.moveTo(x1, y1);
    this.bezierTo(x1, cpy1, cpx2, y2, x2, y2);
    this.done();
  }
}
