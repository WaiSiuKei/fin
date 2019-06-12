import { Paper, Path } from '@fin/svg';
import { Topic } from './topic';

export class Slot extends Path {
  constructor(private parent: Topic) {
    super();
  }

  mountTo(group: SVGGElement) {
    group.appendChild(this.node);
  }

  render() {
    let { x, y } = this.parent.origin;
    x += this.parent.getWidth();
    this.clear();
    this.moveTo(x, y);
    this.lineTo(x + 25, y);
    this.done();
  }
}
