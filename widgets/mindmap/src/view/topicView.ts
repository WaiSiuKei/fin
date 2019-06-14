import { IVector, Vector } from '@fin/geometry';
import { Align, Justify } from '../common';
import { ITopicNode, ITopicViewNode } from '../topic';
import { Path } from '@fin/svg';
import { Signal } from '@fin/signal';
import { Disposable } from '@fin/disposable';
import { addDisposableListener, EventType } from '@fin/dom';

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

  hide() {
    this.clear();
    this.done();
  }

  dispose() {
    this.node.remove();
  }
}

export class TopicViewNode extends Disposable implements ITopicViewNode {
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

  onResize = new Signal<TopicViewNode, void>(this);
  onFocus = new Signal<TopicViewNode, void>(this);
  onBlur = new Signal<TopicViewNode, void>(this);

  constructor(public topicNode: ITopicNode) {
    super();
    this.id = TopicViewNode.counter++;
    this.align = Align.Center;

    this.transform = { x: 0, y: 0 };
    this.slot = new Slot(this);
    this.createElement();
    this._register({
      dispose() {
        Signal.disconnectAll(this);
      }
    });
  }

  createElement() {
    this.container = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    this.container.setAttribute('width', '100px');
    this.container.setAttribute('height', '32px');
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

    this._register(addDisposableListener(this.textarea, EventType.MOUSE_DOWN, this._handleMouseDown.bind(this)));
    this._register(addDisposableListener(this.textarea, EventType.MOUSE_UP, this._handleMouseUp.bind(this)));
    this._register(addDisposableListener(this.textarea, EventType.INPUT, this._handleInput.bind(this)));
    this._register(addDisposableListener(this.textarea, EventType.FOCUS, this._handleFocus.bind(this)));
    this._register(addDisposableListener(this.textarea, EventType.BLUR, this._handleBlur.bind(this)));
  }

  //#region event handler
  private prevWidth: number;
  private prevHeight: number;
  _handleMouseDown() {
    let { width, height } = this.textarea.getBoundingClientRect();
    this.prevWidth = width;
    this.prevHeight = height;
    this.container.style.zIndex = '999';
    this.container.setAttribute('width', '100%');
    this.container.setAttribute('height', '100%');
  }

  _handleMouseUp() {
    let { width, height } = this.textarea.getBoundingClientRect();
    this.container.style.zIndex = '0';
    this.container.setAttribute('width', width + 'px');
    this.container.setAttribute('height', height + 'px');
    if (this.prevWidth !== width || this.prevHeight !== height) {
      this.onResize.emit();
    }
  }

  _handleFocus() {
    this.onFocus.emit();
  }

  _handleBlur() {
    this.onBlur.emit();
  }

  _handleInput(e: KeyboardEvent) {
    // todo update content
  }
  //#endregion

  get tier() {
    return this.topicNode.tier;
  }

  mountTo(g: SVGGElement) {
    g.appendChild(this.container);
    if (!this.topicNode.isRoot) {
      this.slot.mountTo(g);
    }
  }

  add(topic: TopicViewNode) {
    this.children.push(topic);
    topic.parent = this;
  }

  remove(topic: TopicViewNode) {
    let idx = this.children.indexOf(topic);
    if (idx > -1) {
      this.children.splice(idx, 1);
    }
    if (!this.children.length) {
      this.slot.hide();
    }
  }

  getWidth(): number {
    return this.container.clientWidth;
  }

  getHeight(): number {
    return this.container.clientHeight;
  }

  translate(x: number, y: number, origin?: IVector) {
    this.transform = { x, y };
    if (origin) {
      this.origin = origin;
    } else {
      this.origin = { x: 0, y: 0 };
    }
    if (isNaN(this.origin.y)) debugger;
    let tr = Vector.add(this.origin, this.transform, { x: 0, y: 0 });
    this.container.setAttribute('transform', `translate(${tr.x}, ${tr.y })`);
    if (this.children.length && this.slot) this.slot.render();
  }

  focus() {
    this.textarea.focus();
    this.onFocus.emit();
  }

  blur() {
    this.textarea.blur();
    this.onBlur.emit();
  }

  dispose() {
    super.dispose();
    this.container.remove();
    if (this.slot) this.slot.dispose();
  }
}
