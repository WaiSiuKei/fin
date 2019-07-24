/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { StandardMouseEvent } from './mouseEvent';
import { Disposable, IDisposable, dispose } from '@fin/disposable';
import { getSameOriginWindowChain, hasDifferentOriginAncestor } from './iframe';
import { addDisposableListener, addDisposableThrottledListener } from './listener';
import { IEventMerger } from './listener';

export interface IStandardMouseMoveEventData {
  leftButton: boolean;
  posx: number;
  posy: number;
}

export interface IMouseMoveCallback<R> {
  (mouseMoveData: R): void;
}

export interface IOnStopCallback {
  (): void;
}

export function standardMouseMoveMerger(lastEvent: IStandardMouseMoveEventData, currentEvent: MouseEvent): IStandardMouseMoveEventData {
  let ev = new StandardMouseEvent(currentEvent);
  ev.preventDefault();
  return {
    leftButton: ev.leftButton,
    posx: ev.posx,
    posy: ev.posy
  };
}

export class GlobalMouseMoveMonitor<R> extends Disposable {

  private hooks: IDisposable[];
  private mouseMoveEventMerger: IEventMerger<R, MouseEvent>;
  private mouseMoveCallback: IMouseMoveCallback<R>;
  private onStopCallback: IOnStopCallback;

  constructor() {
    super();
    this.hooks = [];
    this.mouseMoveEventMerger = null;
    this.mouseMoveCallback = null;
    this.onStopCallback = null;
  }

  public dispose(): void {
    this.stopMonitoring(false);
    super.dispose();
  }

  public stopMonitoring(invokeStopCallback: boolean): void {
    if (!this.isMonitoring()) {
      // Not monitoring
      return;
    }

    // Unhook
    this.hooks = dispose(this.hooks);
    this.mouseMoveEventMerger = null;
    this.mouseMoveCallback = null;
    let onStopCallback = this.onStopCallback;
    this.onStopCallback = null;

    if (invokeStopCallback) {
      onStopCallback();
    }
  }

  public isMonitoring() {
    return this.hooks.length > 0;
  }

  public startMonitoring(
    mouseMoveEventMerger: IEventMerger<R, MouseEvent>,
    mouseMoveCallback: IMouseMoveCallback<R>,
    onStopCallback: IOnStopCallback
  ): void {
    if (this.isMonitoring()) {
      // I am already hooked
      return;
    }
    this.mouseMoveEventMerger = mouseMoveEventMerger;
    this.mouseMoveCallback = mouseMoveCallback;
    this.onStopCallback = onStopCallback;

    let windowChain = getSameOriginWindowChain();
    for (let i = 0; i < windowChain.length; i++) {
      this.hooks.push(addDisposableThrottledListener(windowChain[i].window.document, 'mousemove',
        (data: R) => this.mouseMoveCallback(data),
        (lastEvent: R, currentEvent) => this.mouseMoveEventMerger(lastEvent, currentEvent as MouseEvent)
      ));
      this.hooks.push(addDisposableListener(windowChain[i].window.document, 'mouseup', (e: MouseEvent) => this.stopMonitoring(true)));
    }

    if (hasDifferentOriginAncestor()) {
      let lastSameOriginAncestor = windowChain[windowChain.length - 1];
      // We might miss a mouse up if it happens outside the iframe
      // This one is for Chrome
      this.hooks.push(addDisposableListener(lastSameOriginAncestor.window.document, 'mouseout', (browserEvent: MouseEvent) => {
        let e = new StandardMouseEvent(browserEvent);
        if (e.target.tagName.toLowerCase() === 'html') {
          this.stopMonitoring(true);
        }
      }));
      // This one is for FF
      this.hooks.push(addDisposableListener(lastSameOriginAncestor.window.document, 'mouseover', (browserEvent: MouseEvent) => {
        let e = new StandardMouseEvent(browserEvent);
        if (e.target.tagName.toLowerCase() === 'html') {
          this.stopMonitoring(true);
        }
      }));
      // This one is for IE
      this.hooks.push(addDisposableListener(lastSameOriginAncestor.window.document.body, 'mouseleave', (browserEvent: MouseEvent) => {
        this.stopMonitoring(true);
      }));
    }
  }
}
