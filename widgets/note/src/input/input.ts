import { Disposable } from '@fin/disposable';
import { addClass, addDisposableListener, EventType, InputEvent, NodeType } from '@fin/dom';
import { KeyCode, StandardKeyboardEvent } from '@fin/keyboard';
import { Signal } from '@fin/signal';
import { IInlineItems, IInputInit, isURL } from './common';
import { InlineRules } from './markdown';
import { InlineStrong } from './inlines/strong';
import { InlinePlainText } from './inlines/text';

export class Input extends Disposable {
  node: HTMLDivElement;

  onInputEnd = new Signal<this, void>(this);
  // onURLAdded: Signal<this, string>;
  // onURLClicked: Signal<this, string>;

  enableURL: boolean;
  multiline: boolean;

  _inlineMap: Map<Node, IInlineItems> = new Map<Node, IInlineItems>();
  _inlines: IInlineItems[] = [];

  constructor(init: Partial<IInputInit> = Object.create(null)) {
    super();

    this.node = document.createElement('div');
    addClass(this.node, 'fin-input');
    this.node.spellcheck = false;
    this.node.contentEditable = 'true';
    this.node.dataset['placeholder'] = init && init.placeholder || '...';

    this.enableURL = init.enableURL;
    this.multiline = init.multiline;

    this.registerListeners();
  }

  registerListeners() {
    this._register(addDisposableListener(this.node, EventType.KEY_DOWN, this.handleKeyDown.bind(this), true));
    this._register(addDisposableListener(this.node, EventType.PASTE, this.handlePaste.bind(this), true));
    this._register(addDisposableListener(this.node, EventType.MOUSE_DOWN, this.handleMouseDown.bind(this), true));
    this._register(addDisposableListener(this.node, EventType.INPUT, this.handleInput.bind(this), true));
    // this._register(addDisposableListener(this.node, EventType.COMPOSITION_START, this.handleInput.bind(this), true));
    // this._register(addDisposableListener(this.node, EventType.COMPOSITION_UPDATE, this.handleInput.bind(this), true));
    // this._register(addDisposableListener(this.node, EventType.COMPOSITION_END, this.handleInput.bind(this), true));
    this._register(addDisposableListener(window, EventType.BLUR, () => this.onInputEnd.emit()));
  }

  //#region event handlers
  handleInput(e: InputEvent) {
    switch (e.inputType) {
      case 'insertText':
        let sel = window.getSelection();
        console.log(window.getSelection().anchorNode);
        if (sel.anchorNode.nodeType !== NodeType.TEXT_NODE) {
          throw new Error('???');
        }
        console.log(window.getSelection().anchorNode);
        let item = this._inlineMap.get(sel.anchorNode.parentNode);
        if (!item) debugger;
        item.update();

        if (InlineRules.strong.exec(item.content)) {
          this.castToStrong(item);
          this.prepareNextInput();
          console.log(window.getSelection().anchorNode);
        }
        break;

      case 'input':
        // console.log(e.data);
        break;
    }
  }

  handleMouseDown(e: MouseEvent) {
    let target = e.target as HTMLElement;

    if (this.enableURL && target.tagName === 'A') {
      let href = target.getAttribute('href');
      // if (isURL(href)) this.onURLClicked.emit(href);
    } else if (!this.node.innerText) {
      // 插入第一个span
      let text = new InlinePlainText('');
      this.node.appendChild(text.node);
      this._inlines.push(text);
      this._inlineMap.set(text.node, text);
      text.setCaretToStart();
    }
  }

  handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
    let text = e.clipboardData.getData('text/plain');

    if (text.indexOf('\n') > -1 || text.indexOf('\r') > -1) return; // 过滤换行

    if (this.enableURL && isURL(text)) {
      this.insertAnchor(text);
    } else {
      this.node.innerText += text;
    }
    document.execCommand('selectAll', false, null);
    document.getSelection().collapseToEnd();
  }

  handleKeyDown(e: KeyboardEvent) {
    let event = new StandardKeyboardEvent(e);
    if (!this.multiline && event.keyCode === KeyCode.Enter) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.onInputEnd.emit();
      this.blur();
    } else {
      // insert <br>
    }
  }
  //#endregion

  blur() {
    this.node.blur();
  }

  focus() {

  }

  focusTail() {

  }

  //#region cast
  castToStrong(item: IInlineItems) {
    let strong = new InlineStrong(item.content);
    this.removeItem(item);
    this.node.appendChild(strong.node);
    this._inlines.push(strong);
    this._inlineMap.set(strong.node, strong);
    strong.blur();
  }

  removeItem(item: IInlineItems) {
    this.node.removeChild(item.node);
    this._inlineMap.delete(item.node);
    let idx = this._inlines.indexOf(item);
    if (idx > -1) {
      this._inlines.splice(idx, 1);
    }
  }

  prepareNextInput() {
    let text = new InlinePlainText('');
    this.node.appendChild(text.node);
    this._inlines.push(text);
    this._inlineMap.set(text.node, text);
    text.setCaretToEnd();
  }

  insertAnchor(text: string): void {
    this.node.innerHTML += `<a href="${text}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:inherit;cursor:pointer;word-wrap:break-word">${text}</a>`;
  }
  //#endregion

  dispose() {
    super.dispose();
    Signal.disconnectAll(this);
  }
}


