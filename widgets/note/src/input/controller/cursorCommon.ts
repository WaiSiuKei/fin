import { ITextModel } from '../model/model';
import { IViewModel } from '../viewModel/viewModel';
import { ICommand, IConfiguration } from '../common';
import { ISelection, Selection } from '../core/selection';
import { Range } from '../core/range';
import { Position } from '../core/position';

export class CursorConfiguration {

  constructor(
    configuration: IConfiguration
  ) {

    let c = configuration.editor;

  }
}

export class CursorContext {
  public readonly model: ITextModel;
  public readonly viewModel: IViewModel;
  public readonly config: CursorConfiguration;

  constructor(configuration: IConfiguration, model: ITextModel, viewModel: IViewModel) {
    this.model = model;
    this.viewModel = viewModel;
    this.config = new CursorConfiguration(
      configuration
    );
  }

  public validateViewPosition(viewPosition: Position, modelPosition: Position): Position {
    return this.viewModel.coordinatesConverter.validateViewPosition(viewPosition, modelPosition);
  }

  public validateViewRange(viewRange: Range, expectedModelRange: Range): Range {
    return this.viewModel.coordinatesConverter.validateViewRange(viewRange, expectedModelRange);
  }

  public convertViewPositionToModelPosition(lineNumber: number, column: number): Position {
    return this.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(lineNumber, column));
  }

  public convertViewRangeToModelRange(viewRange: Range): Range {
    return this.viewModel.coordinatesConverter.convertViewRangeToModelRange(viewRange);
  }

  public convertModelPositionToViewPosition(modelPosition: Position): Position {
    return this.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
  }
}

/**
 * This is an operation type that will be recorded for undo/redo purposes.
 * The goal is to introduce an undo stop when the controller switches between different operation types.
 */
export const enum EditOperationType {
  Other = 0,
  Typing = 1,
  DeletingLeft = 2,
  DeletingRight = 3
}

/**
 * Represents the cursor state on either the model or on the view model.
 */
export class SingleCursorState {
  _singleCursorStateBrand: void;

  // --- selection can start as a range (think double click and drag)
  public readonly selectionStart: Range;
  public readonly selectionStartLeftoverVisibleColumns: number;
  public readonly position: Position;
  public readonly leftoverVisibleColumns: number;
  public readonly selection: Selection;

  constructor(
    selectionStart: Range,
    selectionStartLeftoverVisibleColumns: number,
    position: Position,
    leftoverVisibleColumns: number,
  ) {
    this.selectionStart = selectionStart;
    this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
    this.position = position;
    this.leftoverVisibleColumns = leftoverVisibleColumns;
    this.selection = SingleCursorState._computeSelection(this.selectionStart, this.position);
  }

  public equals(other: SingleCursorState) {
    return (
      this.selectionStartLeftoverVisibleColumns === other.selectionStartLeftoverVisibleColumns
      && this.leftoverVisibleColumns === other.leftoverVisibleColumns
      && this.position.equals(other.position)
      && this.selectionStart.equalsRange(other.selectionStart)
    );
  }

  public hasSelection(): boolean {
    return (!this.selection.isEmpty() || !this.selectionStart.isEmpty());
  }

  public move(inSelectionMode: boolean, lineNumber: number, column: number, leftoverVisibleColumns: number): SingleCursorState {
    if (inSelectionMode) {
      // move just position
      return new SingleCursorState(
        this.selectionStart,
        this.selectionStartLeftoverVisibleColumns,
        new Position(lineNumber, column),
        leftoverVisibleColumns
      );
    } else {
      // move everything
      return new SingleCursorState(
        new Range(lineNumber, column, lineNumber, column),
        leftoverVisibleColumns,
        new Position(lineNumber, column),
        leftoverVisibleColumns
      );
    }
  }

  private static _computeSelection(selectionStart: Range, position: Position): Selection {
    let startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number;
    if (selectionStart.isEmpty()) {
      startLineNumber = selectionStart.startLineNumber;
      startColumn = selectionStart.startColumn;
      endLineNumber = position.lineNumber;
      endColumn = position.column;
    } else {
      if (position.isBeforeOrEqual(selectionStart.getStartPosition())) {
        startLineNumber = selectionStart.endLineNumber;
        startColumn = selectionStart.endColumn;
        endLineNumber = position.lineNumber;
        endColumn = position.column;
      } else {
        startLineNumber = selectionStart.startLineNumber;
        startColumn = selectionStart.startColumn;
        endLineNumber = position.lineNumber;
        endColumn = position.column;
      }
    }
    return new Selection(
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn
    );
  }
}

export class CursorState {
  _cursorStateBrand: void;

  public static fromModelState(modelState: SingleCursorState): CursorState {
    return new CursorState(modelState, null);
  }

  public static fromViewState(viewState: SingleCursorState): CursorState {
    return new CursorState(null, viewState);
  }

  public static fromModelSelection(modelSelection: ISelection): CursorState {
    const selectionStartLineNumber = modelSelection.selectionStartLineNumber;
    const selectionStartColumn = modelSelection.selectionStartColumn;
    const positionLineNumber = modelSelection.positionLineNumber;
    const positionColumn = modelSelection.positionColumn;
    const modelState = new SingleCursorState(
      new Range(selectionStartLineNumber, selectionStartColumn, selectionStartLineNumber, selectionStartColumn), 0,
      new Position(positionLineNumber, positionColumn), 0
    );
    return CursorState.fromModelState(modelState);
  }

  public static fromModelSelections(modelSelections: ISelection[]): CursorState[] {
    let states: CursorState[] = [];
    for (let i = 0, len = modelSelections.length; i < len; i++) {
      states[i] = this.fromModelSelection(modelSelections[i]);
    }
    return states;
  }

  readonly modelState: SingleCursorState;
  readonly viewState: SingleCursorState;

  constructor(modelState: SingleCursorState, viewState: SingleCursorState) {
    this.modelState = modelState;
    this.viewState = viewState;
  }

  public equals(other: CursorState): boolean {
    return (this.viewState.equals(other.viewState) && this.modelState.equals(other.modelState));
  }
}

export class EditOperationResult {
  _editOperationResultBrand: void;

  readonly type: EditOperationType;
  readonly commands: Array<ICommand | null>;
  readonly shouldPushStackElementBefore: boolean;
  readonly shouldPushStackElementAfter: boolean;

  constructor(
    type: EditOperationType,
    commands: Array<ICommand | null>,
    opts: {
      shouldPushStackElementBefore: boolean;
      shouldPushStackElementAfter: boolean;
    }
  ) {
    this.type = type;
    this.commands = commands;
    this.shouldPushStackElementBefore = opts.shouldPushStackElementBefore;
    this.shouldPushStackElementAfter = opts.shouldPushStackElementAfter;
  }
}

