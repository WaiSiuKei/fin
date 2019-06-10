import { ITopic } from './model';
import { Rect } from '@fin/svg';
import { IVector } from '@fin/geometry';

export class Topic extends Rect implements ITopic {
  parent: Topic;
  translateFromParent: IVector;

  constructor() {
    super(10, 10, 10, 10);
  }

  getWidth() {
    return 10;
  }

  getHeight() {
    return 10;
  }

  translate(x: number, y: number) {
    if (!this.parent) {
      super.translate(x, y);
    } else {

    }
  }
}
