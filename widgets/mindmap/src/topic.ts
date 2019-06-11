import { IMatrix, IVector, Matrix } from '@fin/geometry';
import { addClass } from '@fin/dom';
import { TopicGroup } from './topicGroup';
import { getHorizionalSpacingToParent } from './common';

export class Topic {
  parent: Topic;
  container: HTMLElement;
  textarea: HTMLTextAreaElement;

  transform: IMatrix;
  transformOrigin: IVector;
  childrenContainer: TopicGroup;

  constructor() {
    this.transform = Matrix.initial;
    this.childrenContainer = new TopicGroup(this);

    this.createElement();
  }

  createElement() {
    this.container = document.createElement('div');
    addClass(this.container, 'topic');
    Object.defineProperty(this.container, '__ref__', { value: this });
    this.textarea = document.createElement('textarea');
    this.container.appendChild(this.textarea);
    this.textarea.value = 'test test test';
  }

  mountTo(parentNode: HTMLElement) {
    parentNode.appendChild(this.container);
  }

  getWidth(): number {
    return this.container.clientWidth;
  }

  getHeight(): number {
    return this.container.clientHeight;
  }

  getAbsoluteTransform(): IMatrix {
    return Matrix.translate(this.transform, this.transformOrigin);
  }

  getRelativeTransform(): IMatrix {
    return this.transform;
  }

  translate(x: number, y: number, origin?: IVector) {
    this.transform = Matrix.translate(this.transform, { x, y });
    if (origin) {
      this.container.style.top = origin.y + 'px';
      this.container.style.left = origin.x + 'px';
      this.transformOrigin = origin;
    } else {
      this.transformOrigin = { x: 0, y: 0 };
    }
    if (this.parent) {
      this.container.style.transform = `matrix(1, 0, 0, 1, ${this.transform.tx}, ${this.transform.ty - this.getHeight() / 2})`;

    } else {
      this.container.style.transform = `matrix(1, 0, 0, 1, ${this.transform.tx - this.getWidth() / 2}, ${this.transform.ty - this.getHeight() / 2})`;
    }
  }

  add(topic: Topic) {
    this.childrenContainer.add(topic);
  }

  refresh() {
    let spaceLeft = getHorizionalSpacingToParent(this.childrenContainer.tier);
    let mx = this.getAbsoluteTransform();
    this.childrenContainer.translate(spaceLeft, 0, { x: mx.tx, y: mx.ty });
  }
}
