import { IVector, Vector } from '@fin/geometry';
import { Align, Justify } from '../common';
import { ITopicNode, ITopicViewNode } from '../topic';
import { Path } from '@fin/svg';

export class Slot extends Path {
  constructor(private parent: ITopicViewNode) {
    super();
  }

  mountTo(group: SVGGElement) {
    group.appendChild(this.node);
  }

  render() {
    let { x, y } = this.parent.origin;
    if (this.parent.justify === Justify.Left) {
      x += this.parent.getWidth();
      this.clear();
      this.moveTo(x, y);
      this.lineTo(x + 25, y);
      this.done();
    } else {
      x -= this.parent.getWidth();
      this.clear();
      this.moveTo(x, y);
      this.lineTo(x - 25, y);
      this.done();
    }
  }
}

export class TopicViewNode implements ITopicViewNode {
  static counter = 1;

  parent: ITopicViewNode;
  children: ITopicViewNode[] = [];

  container: SVGGraphicsElement;
  textarea: HTMLTextAreaElement;

  transform: IVector;
  origin: IVector;

  align: Align;
  justify: Justify;

  slot: Slot;

  id: number;
  constructor(private node: ITopicNode) {
    this.id = TopicViewNode.counter++;
    this.align = Align.Center;

    this.transform = { x: 0, y: 0 };
    this.slot = new Slot(this);
    this.createElement();
  }

  createElement() {
    this.container = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    this.container.setAttribute('width', '100%');
    this.container.setAttribute('height', '100%');
    this.container.setAttribute('x', '0');
    this.container.setAttribute('y', '0');
    this.container.dataset.id = this.id.toString();
    Object.defineProperty(this.container, '__ref__', { value: this });
    this.textarea = document.createElement('textarea') as HTMLTextAreaElement;
    this.container.appendChild(this.textarea);
    this.textarea.innerText = 'test test test';
    this.textarea.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    this.textarea.style.width = '100px';
    this.textarea.style.height = '32px';
  }

  get tier() {
    return this.node.tier;
  }

  mountTo(g: SVGGElement) {
    g.appendChild(this.container);
    if (!this.node.isRoot) {
      this.slot.mountTo(g);
    }
  }

  add(topic: TopicViewNode) {
    this.children.push(topic);
    topic.parent = this;
  }

  getWidth(): number {
    // return this.textarea.clientWidth;
    return 100;
  }

  getHeight(): number {
    // return this.textarea.clientHeight;
    return 32;
  }

  translate(x: number, y: number, origin?: IVector) {
    this.transform = { x, y };
    if (origin) {
      this.origin = origin;
    } else {
      this.origin = { x: 0, y: 0 };
    }
    let tr = Vector.add(this.origin, this.transform, { x: 0, y: 0 });
    this.container.setAttribute('transform', `translate(${tr.x}, ${tr.y })`);
    if (this.children.length && this.slot) this.slot.render();
  }
}

export class Topic implements ITopicNode {
  static IdCounter = 1;

  id: number;
  parent: Topic;
  children: Topic[] = [];

  constructor() {
    this.id = Topic.IdCounter++;
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

  add(topic: Topic) {
    this.children.push(topic);
    topic.parent = this;
  }
}
