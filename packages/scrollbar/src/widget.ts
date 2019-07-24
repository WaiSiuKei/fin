/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { Disposable } from '@fin/disposable';
import { addDisposableListener, EventType, IMouseEvent, StandardMouseEvent, addDisposableNonBubblingMouseOutListener, InputEvent } from '@fin/dom';
import { StandardKeyboardEvent, IKeyboardEvent } from '@fin/keyboard';

export abstract class Widget extends Disposable {

  protected onclick(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void {
    this._register(addDisposableListener(domNode, EventType.CLICK, (e: MouseEvent) => listener(new StandardMouseEvent(e))));
  }

  protected onmousedown(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void {
    this._register(addDisposableListener(domNode, EventType.MOUSE_DOWN, (e: MouseEvent) => listener(new StandardMouseEvent(e))));
  }

  protected onmouseover(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void {
    this._register(addDisposableListener(domNode, EventType.MOUSE_OVER, (e: MouseEvent) => listener(new StandardMouseEvent(e))));
  }

  protected onnonbubblingmouseout(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void {
    this._register(addDisposableNonBubblingMouseOutListener(domNode, (e: MouseEvent) => listener(new StandardMouseEvent(e))));
  }

  protected onkeydown(domNode: HTMLElement, listener: (e: IKeyboardEvent) => void): void {
    this._register(addDisposableListener(domNode, EventType.KEY_DOWN, (e: KeyboardEvent) => listener(new StandardKeyboardEvent(e))));
  }

  protected onkeyup(domNode: HTMLElement, listener: (e: IKeyboardEvent) => void): void {
    this._register(addDisposableListener(domNode, EventType.KEY_UP, (e: KeyboardEvent) => listener(new StandardKeyboardEvent(e))));
  }

  protected oninput(domNode: HTMLElement, listener: (e: InputEvent) => void): void {
    this._register(addDisposableListener(domNode, EventType.INPUT, listener));
  }

  protected onblur(domNode: HTMLElement, listener: (e: FocusEvent) => void): void {
    this._register(addDisposableListener(domNode, EventType.BLUR, listener));
  }

  protected onfocus(domNode: HTMLElement, listener: (e: FocusEvent) => void): void {
    this._register(addDisposableListener(domNode, EventType.FOCUS, listener));
  }

  // protected onchange(domNode: HTMLElement, listener: (e: Event) => void): void {
  //   this._register(addDisposableListener(domNode, EventType.CHANGE, listener));
  // }
}
