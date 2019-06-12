import { IVector, Vector } from '@fin/geometry';
import { Align, getHorizionalSpacingOfChildren, getVerticalSpacingOfChildren, Justify } from '../common';
import { ITopicNode } from '../topic';
import { IDisposable } from '../../../../packages/disposable/src';
import { Signal } from '../../../../packages/signal/lib';

class TopicPart {
  container: SVGElement;
  textarea: HTMLTextAreaElement;

  transform: IVector;
  origin: IVector;

  align: Align;

  constructor(private node: ITopicNode) {
    this.align = Align.Center;

    this.transform = { x: 0, y: 0 };
  }

  createElement() {
    this.container = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    this.container.setAttribute('width', '100%');
    this.container.setAttribute('height', '100%');
    this.container.setAttribute('x', '0');
    this.container.setAttribute('y', '0');
    Object.defineProperty(this.container, '__ref__', { value: this });
    this.textarea = document.createElement('textarea') as HTMLTextAreaElement;
    this.container.appendChild(this.textarea);
    this.textarea.innerText = 'test test test';
    this.textarea.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    this.textarea.style.width = '100px';
    this.textarea.style.height = '32px';
  }

  get justify() {
    return this.node.isRoot ? Justify.Middle : Justify.Left;
  }

  mountTo(group: SVGGElement) {
    group.appendChild(this.container);
  }

  getWidth(): number {
    return this.textarea.clientWidth;
  }

  getHeight(): number {
    return this.textarea.clientHeight;
  }

  cachedDeepWidth: number = null;
  getDeepWidth(): number {
    if (this.cachedDeepWidth === null) this.measure();
    return this.cachedDeepWidth;
    // return this.children.length ? 100 + getHorizionalSpacingOfChildren(this.tier) : this.getHeight();
  }

  cachedDeepHeight: number = null;
  getDeepHeight(): number {
    if (this.cachedDeepHeight === null) this.measure();
    return this.cachedDeepHeight;
  }

  measure() {
    let tier = this.node.tier;
    this.cachedDeepHeight = this.node.children.length ? this.node.children.reduce((acc, t) => {
      return acc + t.getDeepHeight();
    }, (this.node.children.length - 1) * getVerticalSpacingOfChildren(tier)) : this.getHeight();
    // TODO: width
  }

  _layoutChildren() {
    let len = this.node.children.length;
    if (!len) return;
    let spaceLeft = getHorizionalSpacingOfChildren(this.node.tier);

    let nextOrigin = this.origin;
    if (this.justify === Justify.Left) {
      nextOrigin = Vector.add(this.origin, { x: this.getWidth(), y: 0 });
    }

    if (len === 1) {
      this.node.children[0].translate(0, 0, Vector.add(nextOrigin, { x: spaceLeft, y: 0 }));
    } else {
      let spaceV = getVerticalSpacingOfChildren(this.node.tier);
      let top = -this.getDeepHeight() / 2;
      for (let i = 0; i < len; i++) {
        let topic = this.node.children[i];
        let h = topic.getDeepHeight();
        top += h / 2;
        topic.translate(0, 0, Vector.add(nextOrigin, { x: spaceLeft, y: top }));
        top += h / 2;
        top += spaceV;
      }
    }
  }

  translate(x: number, y: number, origin?: IVector) {
    this.transform = { x, y };
    if (origin) {
      this.origin = origin;
    } else {
      this.origin = { x: 0, y: 0 };
    }
    let tr: IVector;
    if (this.node.parent) {
      tr = Vector.add(this.origin, this.transform, { x: 0, y: -this.getHeight() / 2 });
    } else {
      tr = Vector.add(this.origin, this.transform, { x: -this.getWidth() / 2, y: -this.getHeight() / 2 });
    }
    this.container.setAttribute('transform', `translate(${tr.x}, ${tr.y })`);
    this._layoutChildren();
  }
}

export class Topic implements ITopicNode, IDisposable {
  static IdCounter = 1;

  id: number;
  parent: Topic;
  children: Topic[] = [];

  view: TopicPart;
  onSubTopicAdded = new Signal<Topic, void>(this);

  toDispose: IDisposable[] = [];

  constructor() {
    this.id = Topic.IdCounter++;

    this.view = new TopicPart(this);

    this.toDispose.push({
      dispose() {
        Signal.disconnectAll(this);
      }
    });
  }

  mountTo(group: SVGGElement) {
    this.view.mountTo(group);
  }

  get isRoot() {
    return !this.parent;
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

  getWidth(): number {
    return this.view.getWidth();
  }

  getHeight(): number {
    return this.view.getHeight();
  }

  getDeepWidth(): number {
    return this.view.getDeepWidth();
  }

  getDeepHeight(): number {
    return this.view.getDeepHeight();
  }

  translate(x: number, y: number, origin?: IVector) {
    this.view.translate(x, y, origin);
  }

  add(topic: Topic) {
    this.children.push(topic);
    topic.parent = this;
    this.view.measure();

    topic.onSubTopicAdded.connect(this.handleSubTreeMutation, this);
    this.onSubTopicAdded.emit();
  }

  handleSubTreeMutation(sender: Topic) {
    this.view.measure();
  }
}
