import { ITextModel } from '../model/model';
import { IViewModel } from '../viewModel/viewModel';
import { ICommand, IConfiguration } from '../common';
import { Selection } from '../core/selection';
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

