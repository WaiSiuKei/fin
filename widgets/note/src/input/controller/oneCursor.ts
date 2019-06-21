import { Position } from '../core/position';
import { Range } from '../core/range';
import { Selection } from '../core/selection';
import { CursorContext, SingleCursorState } from './cursorCommon';
import { SelectionDirection } from '../core/selection';

export class OneCursor {

  public modelState: SingleCursorState;
  public viewState: SingleCursorState;

  private _selTrackedRange: string | null;
  private _trackSelection: boolean;

  constructor(context: CursorContext) {
    this._selTrackedRange = null;
    this._trackSelection = true;

    this._setState(
      context,
      new SingleCursorState(new Range(1, 1, 1, 1), 0, new Position(1, 1), 0),
      new SingleCursorState(new Range(1, 1, 1, 1), 0, new Position(1, 1), 0)
    );
  }

  public readSelectionFromMarkers(context: CursorContext): Selection {
    const range = context.model._getTrackedRange(this._selTrackedRange!)!;
    if (this.modelState.selection.getDirection() === SelectionDirection.LTR) {
      return new Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
    }
    return new Selection(range.endLineNumber, range.endColumn, range.startLineNumber, range.startColumn);
  }

  public dispose(context: CursorContext): void {
    this._removeTrackedRange(context);
  }

  private _updateTrackedRange(context: CursorContext): void {
    if (!this._trackSelection) {
      // don't track the selection
      return;
    }
    this._selTrackedRange = context.model._setTrackedRange(this._selTrackedRange, this.modelState.selection, TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges);
  }

  private _removeTrackedRange(context: CursorContext): void {
    this._selTrackedRange = context.model._setTrackedRange(this._selTrackedRange, null, TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges);
  }

  private _setState(context: CursorContext, modelState: SingleCursorState | null, viewState: SingleCursorState | null): void {
    if (!modelState) {
      if (!viewState) {
        return;
      }
      // We only have the view state => compute the model state
      const selectionStart = context.model.validateRange(
        context.convertViewRangeToModelRange(viewState.selectionStart)
      );

      const position = context.model.validatePosition(
        context.convertViewPositionToModelPosition(viewState.position.lineNumber, viewState.position.column)
      );

      modelState = new SingleCursorState(selectionStart, viewState.selectionStartLeftoverVisibleColumns, position, viewState.leftoverVisibleColumns);
    } else {
      // Validate new model state
      const selectionStart = context.model.validateRange(modelState.selectionStart);
      const selectionStartLeftoverVisibleColumns = modelState.selectionStart.equalsRange(selectionStart) ? modelState.selectionStartLeftoverVisibleColumns : 0;

      const position = context.model.validatePosition(
        modelState.position
      );
      const leftoverVisibleColumns = modelState.position.equals(position) ? modelState.leftoverVisibleColumns : 0;

      modelState = new SingleCursorState(selectionStart, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns);
    }

    if (!viewState) {
      // We only have the model state => compute the view state
      const viewSelectionStart1 = context.convertModelPositionToViewPosition(new Position(modelState.selectionStart.startLineNumber, modelState.selectionStart.startColumn));
      const viewSelectionStart2 = context.convertModelPositionToViewPosition(new Position(modelState.selectionStart.endLineNumber, modelState.selectionStart.endColumn));
      const viewSelectionStart = new Range(viewSelectionStart1.lineNumber, viewSelectionStart1.column, viewSelectionStart2.lineNumber, viewSelectionStart2.column);
      const viewPosition = context.convertModelPositionToViewPosition(modelState.position);
      viewState = new SingleCursorState(viewSelectionStart, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
    } else {
      // Validate new view state
      const viewSelectionStart = context.validateViewRange(viewState.selectionStart, modelState.selectionStart);
      const viewPosition = context.validateViewPosition(viewState.position, modelState.position);
      viewState = new SingleCursorState(viewSelectionStart, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
    }

    this.modelState = modelState;
    this.viewState = viewState;

    this._updateTrackedRange(context);
  }
}
