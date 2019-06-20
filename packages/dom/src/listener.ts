import { IDisposable } from '@fin/disposable';
import { IKeyboardEvent, StandardKeyboardEvent } from '@fin/keyboard';
import { IMouseEvent, StandardMouseEvent } from './mouseEvent';

class DomListener implements IDisposable {

  private _handler: (e: any) => void;
  private _node: Element | Window | Document;
  private readonly _type: string;
  private readonly _useCapture: boolean;

  constructor(node: Element | Window | Document, type: string, handler: (e: any) => void, useCapture?: boolean) {
    this._node = node;
    this._type = type;
    this._handler = handler;
    this._useCapture = (useCapture || false);
    this._node.addEventListener(this._type, this._handler, this._useCapture);
  }

  public dispose(): void {
    if (!this._handler) {
      // Already disposed
      return;
    }

    this._node.removeEventListener(this._type, this._handler, this._useCapture);

    // Prevent leakers from holding on to the dom or handler func
    this._node = null!;
    this._handler = null!;
  }
}

export function addDisposableListener<K extends keyof GlobalEventHandlersEventMap>(node: Element | Window | Document, type: K, handler: (event: GlobalEventHandlersEventMap[K]) => void, useCapture?: boolean): IDisposable;
export function addDisposableListener(node: Element | Window | Document, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export function addDisposableListener(node: Element | Window | Document, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable {
  return new DomListener(node, type, handler, useCapture);
}

export interface IAddStandardDisposableListenerSignature {
  (node: HTMLElement, type: 'click', handler: (event: IMouseEvent) => void, useCapture?: boolean): IDisposable;
  (node: HTMLElement, type: 'mousedown', handler: (event: IMouseEvent) => void, useCapture?: boolean): IDisposable;
  (node: HTMLElement, type: 'keydown', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable;
  (node: HTMLElement, type: 'keypress', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable;
  (node: HTMLElement, type: 'keyup', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable;
  (node: HTMLElement, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
}
function _wrapAsStandardMouseEvent(handler: (e: IMouseEvent) => void): (e: MouseEvent) => void {
  return function (e: MouseEvent) {
    return handler(new StandardMouseEvent(e));
  };
}
function _wrapAsStandardKeyboardEvent(handler: (e: IKeyboardEvent) => void): (e: KeyboardEvent) => void {
  return function (e: KeyboardEvent) {
    return handler(new StandardKeyboardEvent(e));
  };
}

export let addStandardDisposableListener: IAddStandardDisposableListenerSignature = function addStandardDisposableListener(node: HTMLElement, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable {
  let wrapHandler = handler;

  if (type === 'click' || type === 'mousedown') {
    wrapHandler = _wrapAsStandardMouseEvent(handler);
  } else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
    wrapHandler = _wrapAsStandardKeyboardEvent(handler);
  }

  return addDisposableListener(node, type, wrapHandler, useCapture);
};

export const EventType = {
  // Mouse
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  MOUSE_UP: 'mouseup',
  MOUSE_DOWN: 'mousedown',
  MOUSE_OVER: 'mouseover',
  MOUSE_MOVE: 'mousemove',
  MOUSE_OUT: 'mouseout',
  MOUSE_ENTER: 'mouseenter',
  MOUSE_LEAVE: 'mouseleave',
  CONTEXT_MENU: 'contextmenu',
  WHEEL: 'wheel',
  // Keyboard
  KEY_DOWN: 'keydown',
  KEY_PRESS: 'keypress',
  KEY_UP: 'keyup',
  // HTML Document
  LOAD: 'load',
  UNLOAD: 'unload',
  ABORT: 'abort',
  ERROR: 'error',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  // Form
  SELECT: 'select',
  CHANGE: 'change',
  SUBMIT: 'submit',
  RESET: 'reset',
  FOCUS: 'focus',
  FOCUS_IN: 'focusin',
  FOCUS_OUT: 'focusout',
  BLUR: 'blur',
  INPUT: 'input',
  // input
  PASTE: 'paste',
  BEFORE_INPUT: 'beforeinput',
  COMPOSITION_START: 'compositionstart',
  COMPOSITION_UPDATE: 'compositionupdate',
  COMPOSITION_END: 'compositionend',
  // Local Storage
  STORAGE: 'storage',
  // Drag
  DRAG_START: 'dragstart',
  DRAG: 'drag',
  DRAG_ENTER: 'dragenter',
  DRAG_LEAVE: 'dragleave',
  DRAG_OVER: 'dragover',
  DROP: 'drop',
  DRAG_END: 'dragend',
  // Animation
  // ANIMATION_START: browser.isWebKit ? 'webkitAnimationStart' : 'animationstart',
  // ANIMATION_END: browser.isWebKit ? 'webkitAnimationEnd' : 'animationend',
  // ANIMATION_ITERATION: browser.isWebKit ? 'webkitAnimationIteration' : 'animationiteration'
};

export interface InputEvent {
  data: string;
  isComposing: boolean;
  inputType: string;
}
