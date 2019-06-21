import { ViewEventHandler } from '../viewModel/viewEventHandler';
import { createFastDomNode, FastDomNode, runAtThisOrScheduleAtNextAnimationFrame } from '@fin/dom';
import { ViewPart } from './viewPart';
import { ITextAreaHandlerHelper, TextAreaHandler } from '../textArea/textAreaHandler';
import { IDisposable } from '@fin/disposable';
import { ICommandDelegate, ViewController } from './viewController';
import { ViewContext } from './viewContext';
import { IViewModel } from '../viewModel/viewModel';
import { IConfiguration } from '../common';
import { Position } from '../core/position';
import { Cursor } from '../controller/cursor';

const invalidFunc = () => { throw new Error(`Invalid change accessor`); };

export class View extends ViewEventHandler {

  private readonly _context: ViewContext;
  private readonly _cursor: Cursor;

  // The view lines
  // private viewLines: ViewLines;

  // These are parts, but we must do some API related calls on them, so we keep a reference
  private viewParts: ViewPart[];

  private readonly _textAreaHandler: TextAreaHandler;

  // Dom nodes
  public domNode: FastDomNode<HTMLElement>;
  private overflowGuardContainer: FastDomNode<HTMLElement>;

  // Actual mutable state
  private _renderAnimationFrame: IDisposable | null;

  constructor(
    commandDelegate: ICommandDelegate,
    configuration: IConfiguration,
    model: IViewModel,
    cursor: Cursor,
  ) {
    super();
    this._cursor = cursor;
    this._renderAnimationFrame = null;

    const viewController = new ViewController(configuration, model, commandDelegate);

    // The view context is passed on to most classes (basically to reduce param. counts in ctors)
    this._context = new ViewContext(configuration, model);

    this.viewParts = [];

    // Keyboard handler
    this._textAreaHandler = new TextAreaHandler(this._context, this.createTextAreaHandlerHelper());
    this.viewParts.push(this._textAreaHandler);

    this.createViewParts();
    this._setLayout();
  }

  private createViewParts(): void {
    // These two dom nodes must be constructed up front, since references are needed in the layout provider (scrolling & co.)

    this.domNode = createFastDomNode(document.createElement('div'));

    this.overflowGuardContainer = createFastDomNode(document.createElement('div'));
    this.overflowGuardContainer.setClassName('overflow-guard');

    // -------------- Wire dom nodes up

    this.overflowGuardContainer.appendChild(this._textAreaHandler.textArea);
    this.overflowGuardContainer.appendChild(this._textAreaHandler.textAreaCover);
    this.domNode.appendChild(this.overflowGuardContainer);
  }

  private _flushAccumulatedAndRenderNow(): void {
    this._renderNow();
  }

  private createTextAreaHandlerHelper(): ITextAreaHandlerHelper {
    return {
      visibleRangeForPositionRelativeToEditor: (lineNumber: number, column: number) => {
        this._flushAccumulatedAndRenderNow();
        // return this.viewLines.visibleRangeForPosition(new Position(lineNumber, column));
        return null;
      }
    };
  }

  private _setLayout(): void {
    const layoutInfo = this._context.configuration.editor.layoutInfo;
    this.domNode.setWidth(layoutInfo.width);
    this.domNode.setHeight(layoutInfo.height);

    this.overflowGuardContainer.setWidth(layoutInfo.width);
    this.overflowGuardContainer.setHeight(layoutInfo.height);

  }

  public dispose(): void {
    if (this._renderAnimationFrame !== null) {
      this._renderAnimationFrame.dispose();
      this._renderAnimationFrame = null;
    }

    // Destroy view parts
    for (let i = 0, len = this.viewParts.length; i < len; i++) {
      this.viewParts[i].dispose();
    }
    this.viewParts = [];

    super.dispose();
  }

  private _renderOnce(callback: () => any): any {
    const r = safeInvokeNoArg(callback);
    this._scheduleRender();
    return r;
  }

  private _scheduleRender(): void {
    if (this._renderAnimationFrame === null) {
      this._renderAnimationFrame = runAtThisOrScheduleAtNextAnimationFrame(this._onRenderScheduled.bind(this), 100);
    }
  }

  private _onRenderScheduled(): void {
    this._renderAnimationFrame = null;
    this._flushAccumulatedAndRenderNow();
  }

  private _renderNow(): void {
    safeInvokeNoArg(() => this._actualRender());
  }

  private _getViewPartsToRender(): ViewPart[] {
    let result: ViewPart[] = [], resultLen = 0;
    for (let i = 0, len = this.viewParts.length; i < len; i++) {
      const viewPart = this.viewParts[i];
      if (viewPart.shouldRender()) {
        result[resultLen++] = viewPart;
      }
    }
    return result;
  }

  private _actualRender(): void {

    let viewPartsToRender = this._getViewPartsToRender();

    const renderingContext: any = null;

    // Render the rest of the parts
    for (let i = 0, len = viewPartsToRender.length; i < len; i++) {
      const viewPart = viewPartsToRender[i];
      viewPart.prepareRender(renderingContext);
    }

    for (let i = 0, len = viewPartsToRender.length; i < len; i++) {
      const viewPart = viewPartsToRender[i];
      viewPart.render(renderingContext);
      viewPart.onDidRender();
    }
  }

  // --- BEGIN CodeEditor helpers

  public render(now: boolean, everything: boolean): void {
    if (everything) {
      // Force everything to render...
      for (let i = 0, len = this.viewParts.length; i < len; i++) {
        const viewPart = this.viewParts[i];
        viewPart.forceShouldRender();
      }
    }
    if (now) {
      this._flushAccumulatedAndRenderNow();
    } else {
      this._scheduleRender();
    }
  }

  public focus(): void {
    this._textAreaHandler.focusTextArea();
  }

  public isFocused(): boolean {
    return this._textAreaHandler.isFocused();
  }
}

function safeInvokeNoArg(func: Function): any {
  try {
    return func();
  } catch (e) {
    throw e;
  }
}

function safeInvoke1Arg(func: Function, arg1: any): any {
  try {
    return func(arg1);
  } catch (e) {
    throw (e);
  }
}
