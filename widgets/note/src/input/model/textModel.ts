import { ICursorStateComputer, IIdentifiedSingleEditOperation, ITextModel, TrackedRangeStickiness } from './model';
import { Disposable } from '@fin/disposable';
import { Range } from '../core/range';
import { Selection } from '../core/selection';

export class TextModel extends Disposable implements ITextModel {

  private _isDisposed: boolean;
  private _isDisposing: boolean;
  /**
   * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
   */

  constructor(source: string) {
    super();

    this._isDisposed = false;
    this._isDisposing = false;
  }

  public dispose(): void {
    this._isDisposing = true;
    this._isDisposed = true;
    // Null out members, such that any use of a disposed model will throw exceptions sooner rather than later
    super.dispose();
    this._isDisposing = false;
  }

  _getTrackedRange(id: string): Range | null {
    return null;
  }

  _setTrackedRange(id: string | null, newRange: null, newStickiness: TrackedRangeStickiness): null;
  _setTrackedRange(id: string | null, newRange: Range, newStickiness: TrackedRangeStickiness): string;
  _setTrackedRange(id: string | null, newRange: Range | null, newStickiness: TrackedRangeStickiness): string | null {
    return null;
    /*
    if (!newRange) {
      // node doesn't exist, the request is to delete => nothing to do
      return null;
    }
    // node doesn't exist, the request is to set => add the tracked range
    return this._deltaDecorationsImpl(0, [], [{ range: newRange, options: TRACKED_RANGE_OPTIONS[newStickiness] }])[0];
    */
  }

  public pushEditOperations(beforeCursorState: Selection[], editOperations: IIdentifiedSingleEditOperation[], cursorStateComputer: ICursorStateComputer | null): Selection[] | null {
    return this._pushEditOperations(beforeCursorState, editOperations, cursorStateComputer);
  }

  private _pushEditOperations(beforeCursorState: Selection[], editOperations: IIdentifiedSingleEditOperation[], cursorStateComputer: ICursorStateComputer | null): Selection[] | null {
    return this._commandManager.pushEditOperation(beforeCursorState, editOperations, cursorStateComputer);
  }

}

