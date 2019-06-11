import { addClass } from '@fin/dom';
import { Matrix, IMatrix, IVector } from '@fin/geometry';
import { Topic } from './topic';
import { getHorizionalSpacingToParent, getVerticalSpacingToParent } from './common';

export class TopicGroup {
  container: HTMLElement;
  transform: IMatrix;
  transformOrigin: IVector;
  topics: Topic[] = [];

  constructor(public parent: Topic) {
    this.createElement();
    this.transform = Matrix.initial;
  }

  get tier(): number {
    let p = this.parent;
    let counter = 0;
    while (p) {
      counter++;
      p = p.parent;
    }
    return counter;
  }

  get length() {
    return this.topics.length;
  }

  createElement() {
    this.container = document.createElement('div');
    Object.defineProperty(this.container, '__ref__', { value: this });
    addClass(this.container, 'topic-group');
  }

  mountTo(node: HTMLElement) {
    let es = Array.prototype.slice.call(node.children);
    if (es.indexOf(this.container) === -1) {
      node.appendChild(this.container);
    }
  }

  getWidth(): number {
    return this.topics.length ? 100 + getHorizionalSpacingToParent(this.tier + 1) : 0;
  }

  getHeight(): number {
    return this.topics.length ? this.topics.reduce((acc, t) => {
      return acc + t.getHeight();
    }, (this.topics.length + 1) * getVerticalSpacingToParent(this.tier + 1)) : 0;
  }

  add(topic: Topic) {
    topic.mountTo(this.container);
    this.topics.push(topic);
    topic.parent = this.parent;
  }

  remove() {

  }

  translate(x: number, y: number, origin: IVector) {
    this.transformOrigin = origin;
    this.transform = Matrix.translate(this.transform, { x, y });
    this._layoutChildren(origin.x, origin.y);
    // handle children
    this.container.style.top = origin.y + 'px';
    this.container.style.left = origin.x + 'px';
    this.container.style.transform = `matrix(1, 0, 0, 1, ${this.transform.tx}, ${this.transform.ty - this.getHeight() / 2})`;
    this.container.style.width = this.getWidth() + 'px';
    this.container.style.height = this.getHeight() + 'px';
  }

  _layoutChildren(x: number, y: number) {
    let tier = this.tier;
    let spaceV = getVerticalSpacingToParent(tier + 1);
    let spaceH = getHorizionalSpacingToParent(tier + 1);
    let top = 0;
    for (let i = 0, len = this.topics.length; i < len; i++) {
      let topic = this.topics[i];
      top += spaceV;
      let h = topic.getHeight();
      top += h / 2;
      topic.translate(0, 0, { x: spaceH, y: top });
      top += h / 2;
    }
  }
}
