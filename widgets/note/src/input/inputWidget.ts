import { EndOfLinePreference } from './model';
import { Disposable, dispose, IDisposable } from '@fin/disposable';
import { Handler, IConfiguration } from './common';
import { IDimension } from './core/dimension';
import { View } from './view/viewImpl';
import { ITextModel } from './model/model';
import { ViewModel } from './viewModel/viewModelImpl';
import { Cursor } from './controller/cursor';
import { ICommandDelegate } from './view/viewController';
import { scheduleAtNextAnimationFrame } from '@fin/dom';
import { InternalEditorOptions } from './config/editorOptions';

let EDITOR_ID = 0;

class ModelData {
  public readonly model: ITextModel;
  public readonly viewModel: ViewModel;
  public readonly cursor: Cursor;
  public readonly view: View;
  public readonly hasRealView: boolean;
  public readonly listenersToRemove: IDisposable[];

  constructor(model: ITextModel, viewModel: ViewModel, cursor: Cursor, view: View, hasRealView: boolean, listenersToRemove: IDisposable[]) {
    this.model = model;
    this.viewModel = viewModel;
    this.cursor = cursor;
    this.view = view;
    this.hasRealView = hasRealView;
    this.listenersToRemove = listenersToRemove;
  }

  public dispose(): void {
    dispose(this.listenersToRemove);
    if (this.hasRealView) {
      this.view.dispose();
    }
    this.cursor.dispose();
    this.viewModel.dispose();
  }
}

export class InputWidget extends Disposable {

  private readonly _domElement: HTMLElement;
  private readonly _id: number;
  private readonly _configuration: IConfiguration;

  // --- Members logically associated to a model
  protected _modelData: ModelData | null;

  constructor(
    domElement: HTMLElement,
  ) {
    super();
    this._domElement = domElement;
    this._id = (++EDITOR_ID);

    this._configuration = {
      editor: new InternalEditorOptions({
        lineHeight: 20,
        layoutInfo: {
          width: this._domElement.clientWidth,
          height: this._domElement.clientHeight,
          contentLeft: 0,
          contentWidth: this._domElement.clientWidth,
          contentHeight: this._domElement.clientHeight
        }
      })
    };

    this._attachModel(null);
  }

  public setModel(_model: ITextModel | null = null): void {
    const model = <ITextModel | null>_model;
    if (this._modelData === null && model === null) {
      // Current model is the new model
      return;
    }
    if (this._modelData && this._modelData.model === model) {
      // Current model is the new model
      return;
    }

    this._attachModel(model);
  }

  public trigger(source: string, handlerId: string, payload: any): void {
    payload = payload || {};

    // Special case for typing
    if (handlerId === Handler.Type) {
      if (!this._modelData || typeof payload.text !== 'string' || payload.text.length === 0) {
        // nothing to do
        return;
      }
      this._modelData.cursor.trigger(source, handlerId, payload);
    }

    if (!this._modelData) {
      return;
    }

    // this._modelData.cursor.trigger(source, handlerId, payload);
  }

  // public executeCommand(source: string, command: ICommand): void {
  //   if (!this._modelData) {
  //     return;
  //   }
  //   this._modelData.cursor.trigger(source, Handler.ExecuteCommand, command);
  // }

  public getDomNode(): HTMLElement | null {
    if (!this._modelData || !this._modelData.hasRealView) {
      return null;
    }
    return this._modelData.view.domNode.domNode;
  }

  public layout(dimension?: IDimension): void {
    this._configuration.observeReferenceElement(dimension);
    this.render();
  }

  public focus(): void {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }

    this._modelData.view.focus();
  }

  public render(forceRedraw: boolean = false): void {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.view.render(true, forceRedraw);
  }

  protected _attachModel(model: ITextModel | null): void {
    if (!model) {
      this._modelData = null;
      return;
    }

    const listenersToRemove: IDisposable[] = [];

    const viewModel = new ViewModel(this._id, this._configuration, model, (callback) => scheduleAtNextAnimationFrame(callback));

    const cursor = new Cursor(this._configuration, model, viewModel);

    const [view, hasRealView] = this._createView(viewModel, cursor);
    if (hasRealView) {
      this._domElement.appendChild(view.domNode.domNode);

      view.render(false, true);
    }

    this._modelData = new ModelData(model, viewModel, cursor, view, hasRealView, listenersToRemove);
  }

  protected _createView(viewModel: ViewModel, cursor: Cursor): [View, boolean] {
    let commandDelegate: ICommandDelegate = {
      // executeEditorCommand: (editorCommand: CoreEditorCommand, args: any): void => {
      //   editorCommand.runCoreEditorCommand(cursor, args);
      // },
      // paste: (source: string, text: string, pasteOnNewLine: boolean, multicursorText: string[] | null) => {
      //   this.trigger(source, Handler.Paste, { text, pasteOnNewLine, multicursorText });
      // },
      type: (source: string, text: string) => {
        this.trigger(source, Handler.Type, { text });
      },
      // replacePreviousChar: (source: string, text: string, replaceCharCnt: number) => {
      //   this.trigger(source, Handler.ReplacePreviousChar, { text, replaceCharCnt });
      // },
      // compositionStart: (source: string) => {
      //   this.trigger(source, Handler.CompositionStart, undefined);
      // },
      // compositionEnd: (source: string) => {
      //   this.trigger(source, Handler.CompositionEnd, undefined);
      // },
      // cut: (source: string) => {
      //   this.trigger(source, Handler.Cut, undefined);
      // }
    };

    const view = new View(
      commandDelegate,
      this._configuration,
      viewModel,
      cursor,
    );

    return [view, true];
  }
}
