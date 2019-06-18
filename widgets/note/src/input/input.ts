import { Disposable } from '@fin/disposable';
import { addClass, addDisposableListener, EventType, InputEvent } from '@fin/dom';
import { KeyCode, StandardKeyboardEvent } from '@fin/keyboard';
import { Signal } from '@fin/signal';
import { IInlineItems, IInputInit, isURL } from './common';

export class Input extends Disposable {
  node: HTMLDivElement;

  onInputEnd = new Signal<this, void>(this);
  // onURLAdded: Signal<this, string>;
  // onURLClicked: Signal<this, string>;

  enableURL: boolean;
  items: IInlineItems[] = [];

  constructor(init: Partial<IInputInit> = Object.create(null)) {
    super();

    this.node = document.createElement('div');
    addClass(this.node, 'fin-input');
    this.node.spellcheck = false;
    this.node.contentEditable = 'true';
    this.node.dataset['placeholder'] = init && init.placeholder || '...';

    this.enableURL = init.enableURL;
    if (this.enableURL) {

    }

    this.registerListeners();
  }

  registerListeners() {
    this._register(addDisposableListener(this.node, EventType.KEY_DOWN, this.handleKeyDown.bind(this), true));
    this._register(addDisposableListener(this.node, EventType.PASTE, this.handlePaste.bind(this), true));
    this._register(addDisposableListener(this.node, EventType.MOUSE_DOWN, this.handleMouseDown.bind(this), true));
    this._register(addDisposableListener(this.node, EventType.INPUT, this.handleInput.bind(this), true));
    this._register(addDisposableListener(this.node, EventType.COMPOSITION_START, this.handleInput.bind(this), true));
    this._register(addDisposableListener(window, EventType.BLUR, () => this.onInputEnd.emit()));
  }

  //#region event handlers
  handleInput(e: InputEvent) {
    console.log(e);
    switch (e.inputType) {
      case 'insertText':
        console.log(e.data);
        break;
    }
  }

  handleMouseDown(e: MouseEvent) {
    let target = e.target as HTMLElement;

    if (this.enableURL && target.tagName === 'A') {
      let href = target.getAttribute('href');
      // if (isURL(href)) this.onURLClicked.emit(href);
    } else {

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
    if (event.keyCode === KeyCode.Enter) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.onInputEnd.emit();
      this.blur();
    }
  }
  //#endregion

  blur() {
    this.node.blur();
  }

  focus() {

  }

  insertAnchor(text: string): void {
    this.node.innerHTML += `<a href="${text}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:inherit;cursor:pointer;word-wrap:break-word">${text}</a>`;
  }

  dispose() {
    super.dispose();
    Signal.disconnectAll(this);
  }
}


