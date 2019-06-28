import { Disposable } from '@fin/disposable';
import { IIdentifiedSingleEditOperation, ITextModel, TrackedRangeStickiness } from '../model/model';
import { Handler, ICommand, IConfiguration, IEditOperationBuilder } from '../common';
import { IViewModel } from '../viewModel/viewModel';
import { isHighSurrogate } from '@fin/strings';
import { TypeOperations } from './cursorTypeOperations';
import { CursorContext, CursorState, EditOperationResult, EditOperationType } from './cursorCommon';
import { OneCursor } from './oneCursor';
import { SelectionDirection } from '../core/selection';
import { Selection } from '../core/selection';
import { Range } from '../core/range';

export class Cursor extends Disposable {
  private _isDoingComposition: boolean;
  public context: CursorContext;

  private _prevEditOperationType: EditOperationType;
  private primaryCursor: OneCursor;

  constructor(private _configuration: IConfiguration, private _model: ITextModel, private _viewModel: IViewModel) {
    super();
    this.context = new CursorContext(this._configuration, this._model, this._viewModel);
    this.primaryCursor = new OneCursor(this.context);
    this._isDoingComposition = false;
    this._prevEditOperationType = EditOperationType.Other;
  }

  public dispose(): void {
    super.dispose();
  }

  public trigger(source: string, handlerId: string, payload: any): void {
    try {
      switch (handlerId) {
        case Handler.Type:
          this._type(source, <string>payload.text);
          break;

        // case Handler.ReplacePreviousChar:
        //   this._replacePreviousChar(<string>payload.text, <number>payload.replaceCharCnt);
        //   break;
        //
        // case Handler.Paste:
        //   cursorChangeReason = CursorChangeReason.Paste;
        //   this._paste(<string>payload.text, <boolean>payload.pasteOnNewLine, <string[]>payload.multicursorText);
        //   break;
        //
        // case Handler.Cut:
        //   this._cut();
        //   break;
        //
        // case Handler.Undo:
        //   cursorChangeReason = CursorChangeReason.Undo;
        //   this._interpretCommandResult(this._model.undo());
        //   break;
        //
        // case Handler.Redo:
        //   cursorChangeReason = CursorChangeReason.Redo;
        //   this._interpretCommandResult(this._model.redo());
        //   break;
        //
        // case Handler.ExecuteCommand:
        //   this._externalExecuteCommand(<ICommand>payload);
        //   break;
        //
        // case Handler.ExecuteCommands:
        //   this._externalExecuteCommands(<ICommand[]>payload);
        //   break;
        //
        // case Handler.CompositionEnd:
        //   this._interpretCompositionEnd(source);
        //   break;
      }
    } catch (err) {
      console.error(err);
    }
  }

  private _type(source: string, text: string): void {
    if (!this._isDoingComposition && source === 'keyboard') {
      // If this event is coming straight from the keyboard, look for electric characters and enter

      for (let i = 0, len = text.length; i < len; i++) {
        let charCode = text.charCodeAt(i);
        let chr: string;
        if (isHighSurrogate(charCode) && i + 1 < len) {
          chr = text.charAt(i) + text.charAt(i + 1);
          i++;
        } else {
          chr = text.charAt(i);
        }

        // Here we must interpret each typed character individually, that's why we create a new context
        this._executeEditOperation(TypeOperations.typeWithInterceptors(this._prevEditOperationType, this.context.config, this.context.model, this.getSelections(), chr));
      }

    } else {
      this._executeEditOperation(TypeOperations.typeWithoutInterceptors(this._prevEditOperationType, this.context.config, this.context.model, this.getSelections(), text));
    }
  }

  private _executeEditOperation(opResult: EditOperationResult | null): void {

    if (!opResult) {
      // Nothing to execute
      return;
    }

    if (opResult.shouldPushStackElementBefore) {
      this._model.pushStackElement();
    }

    const result = CommandExecutor.executeCommands(this._model, this.getSelections(), opResult.commands);
    if (result) {
      // The commands were applied correctly
      this._interpretCommandResult(result);

      this._prevEditOperationType = opResult.type;
    }

    if (opResult.shouldPushStackElementAfter) {
      this._model.pushStackElement();
    }
  }

  private _interpretCommandResult(cursorState: Selection[] | null): void {
    if (!cursorState || cursorState.length === 0) {
      return;
    }

    let s = CursorState.fromModelSelections(cursorState);
    this.primaryCursor.setState(this.context, s[0].modelState, s[0].viewState);
  }

  public getSelections(): Selection[] {
    return [this.primaryCursor.modelState.selection];
  }
}

interface IExecContext {
  readonly model: ITextModel;
  readonly selectionsBefore: Selection[];
  readonly trackedRanges: string[];
  readonly trackedRangesDirection: SelectionDirection[];
}

interface ICommandData {
  operations: IIdentifiedSingleEditOperation[];
  hadTrackedEditOperation: boolean;
}

interface ICommandsData {
  operations: IIdentifiedSingleEditOperation[];
  hadTrackedEditOperation: boolean;
}

class CommandExecutor {

  public static executeCommands(model: ITextModel, selectionsBefore: Selection[], commands: (ICommand | null)[]): Selection[] | null {

    const ctx: IExecContext = {
      model: model,
      selectionsBefore: selectionsBefore,
      trackedRanges: [],
      trackedRangesDirection: []
    };

    const result = this._innerExecuteCommands(ctx, commands);

    for (let i = 0, len = ctx.trackedRanges.length; i < len; i++) {
      ctx.model._setTrackedRange(ctx.trackedRanges[i], null, TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges);
    }

    return result;
  }

  private static _innerExecuteCommands(ctx: IExecContext, commands: (ICommand | null)[]): Selection[] | null {

    if (this._arrayIsEmpty(commands)) {
      return null;
    }

    const commandsData = this._getEditOperations(ctx, commands);
    if (commandsData.operations.length === 0) {
      return null;
    }

    const rawOperations = commandsData.operations;

    const loserCursorsMap = this._getLoserCursorMap(rawOperations);
    if (loserCursorsMap.hasOwnProperty('0')) {
      // These commands are very messed up
      console.warn('Ignoring commands');
      return null;
    }

    // Remove operations belonging to losing cursors
    let filteredOperations: IIdentifiedSingleEditOperation[] = [];
    for (let i = 0, len = rawOperations.length; i < len; i++) {
      if (!loserCursorsMap.hasOwnProperty(rawOperations[i].identifier!.major.toString())) {
        filteredOperations.push(rawOperations[i]);
      }
    }

    // TODO@Alex: find a better way to do this.
    // give the hint that edit operations are tracked to the model
    if (commandsData.hadTrackedEditOperation && filteredOperations.length > 0) {
      filteredOperations[0]._isTracked = true;
    }
    let selectionsAfter = ctx.model.pushEditOperations(ctx.selectionsBefore, filteredOperations, (inverseEditOperations: IIdentifiedSingleEditOperation[]): Selection[] => {
      let groupedInverseEditOperations: IIdentifiedSingleEditOperation[][] = [];
      for (let i = 0; i < ctx.selectionsBefore.length; i++) {
        groupedInverseEditOperations[i] = [];
      }
      for (const op of inverseEditOperations) {
        if (!op.identifier) {
          // perhaps auto whitespace trim edits
          continue;
        }
        groupedInverseEditOperations[op.identifier.major].push(op);
      }
      const minorBasedSorter = (a: IIdentifiedSingleEditOperation, b: IIdentifiedSingleEditOperation) => {
        return a.identifier!.minor - b.identifier!.minor;
      };
      let cursorSelections: Selection[] = [];
      for (let i = 0; i < ctx.selectionsBefore.length; i++) {
        if (groupedInverseEditOperations[i].length > 0) {
          groupedInverseEditOperations[i].sort(minorBasedSorter);
          cursorSelections[i] = commands[i]!.computeCursorState(ctx.model, {
            getInverseEditOperations: () => {
              return groupedInverseEditOperations[i];
            },

            getTrackedSelection: (id: string) => {
              const idx = parseInt(id, 10);
              const range = ctx.model._getTrackedRange(ctx.trackedRanges[idx])!;
              if (ctx.trackedRangesDirection[idx] === SelectionDirection.LTR) {
                return new Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
              }
              return new Selection(range.endLineNumber, range.endColumn, range.startLineNumber, range.startColumn);
            }
          });
        } else {
          cursorSelections[i] = ctx.selectionsBefore[i];
        }
      }
      return cursorSelections;
    });
    if (!selectionsAfter) {
      selectionsAfter = ctx.selectionsBefore;
    }

    // Extract losing cursors
    let losingCursors: number[] = [];
    for (let losingCursorIndex in loserCursorsMap) {
      if (loserCursorsMap.hasOwnProperty(losingCursorIndex)) {
        losingCursors.push(parseInt(losingCursorIndex, 10));
      }
    }

    // Sort losing cursors descending
    losingCursors.sort((a: number, b: number): number => {
      return b - a;
    });

    // Remove losing cursors
    for (const losingCursor of losingCursors) {
      selectionsAfter.splice(losingCursor, 1);
    }

    return selectionsAfter;
  }

  private static _arrayIsEmpty(commands: (ICommand | null)[]): boolean {
    for (let i = 0, len = commands.length; i < len; i++) {
      if (commands[i]) {
        return false;
      }
    }
    return true;
  }

  private static _getEditOperations(ctx: IExecContext, commands: (ICommand | null)[]): ICommandsData {
    let operations: IIdentifiedSingleEditOperation[] = [];
    let hadTrackedEditOperation: boolean = false;

    for (let i = 0, len = commands.length; i < len; i++) {
      const command = commands[i];
      if (command) {
        const r = this._getEditOperationsFromCommand(ctx, i, command);
        operations = operations.concat(r.operations);
        hadTrackedEditOperation = hadTrackedEditOperation || r.hadTrackedEditOperation;
      }
    }
    return {
      operations: operations,
      hadTrackedEditOperation: hadTrackedEditOperation
    };
  }

  private static _getEditOperationsFromCommand(ctx: IExecContext, majorIdentifier: number, command: ICommand): ICommandData {
    // This method acts as a transaction, if the command fails
    // everything it has done is ignored
    let operations: IIdentifiedSingleEditOperation[] = [];
    let operationMinor = 0;

    const addEditOperation = (selection: Range, text: string | null) => {
      if (selection.isEmpty() && text === '') {
        // This command wants to add a no-op => no thank you
        return;
      }
      operations.push({
        identifier: {
          major: majorIdentifier,
          minor: operationMinor++
        },
        range: selection,
        text: text,
        forceMoveMarkers: false,
        isAutoWhitespaceEdit: command.insertsAutoWhitespace
      });
    };

    let hadTrackedEditOperation = false;
    const addTrackedEditOperation = (selection: Range, text: string | null) => {
      hadTrackedEditOperation = true;
      addEditOperation(selection, text);
    };

    const trackSelection = (selection: Selection, trackPreviousOnEmpty?: boolean) => {
      let stickiness: TrackedRangeStickiness;
      if (selection.isEmpty()) {
        if (typeof trackPreviousOnEmpty === 'boolean') {
          if (trackPreviousOnEmpty) {
            stickiness = TrackedRangeStickiness.GrowsOnlyWhenTypingBefore;
          } else {
            stickiness = TrackedRangeStickiness.GrowsOnlyWhenTypingAfter;
          }
        } else {
          // Try to lock it with surrounding text
          const maxLineColumn = ctx.model.getLineMaxColumn(selection.startLineNumber);
          if (selection.startColumn === maxLineColumn) {
            stickiness = TrackedRangeStickiness.GrowsOnlyWhenTypingBefore;
          } else {
            stickiness = TrackedRangeStickiness.GrowsOnlyWhenTypingAfter;
          }
        }
      } else {
        stickiness = TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges;
      }

      const l = ctx.trackedRanges.length;
      const id = ctx.model._setTrackedRange(null, selection, stickiness);
      ctx.trackedRanges[l] = id;
      ctx.trackedRangesDirection[l] = selection.getDirection();
      return l.toString();
    };

    const editOperationBuilder: IEditOperationBuilder = {
      addEditOperation: addEditOperation,
      addTrackedEditOperation: addTrackedEditOperation,
      trackSelection: trackSelection
    };

    try {
      command.getEditOperations(ctx.model, editOperationBuilder);
    } catch (e) {
      // TODO@Alex use notification service if this should be user facing
      // e.friendlyMessage = nls.localize('corrupt.commands', "Unexpected exception while executing command.");
      console.error(e);
      return {
        operations: [],
        hadTrackedEditOperation: false
      };
    }

    return {
      operations: operations,
      hadTrackedEditOperation: hadTrackedEditOperation
    };
  }

  private static _getLoserCursorMap(operations: IIdentifiedSingleEditOperation[]): { [index: string]: boolean; } {
    // This is destructive on the array
    operations = operations.slice(0);

    // Sort operations with last one first
    operations.sort((a: IIdentifiedSingleEditOperation, b: IIdentifiedSingleEditOperation): number => {
      // Note the minus!
      return -(Range.compareRangesUsingEnds(a.range, b.range));
    });

    // Operations can not overlap!
    let loserCursorsMap: { [index: string]: boolean; } = {};

    for (let i = 1; i < operations.length; i++) {
      const previousOp = operations[i - 1];
      const currentOp = operations[i];

      if (previousOp.range.getStartPosition().isBefore(currentOp.range.getEndPosition())) {

        let loserMajor: number;

        if (previousOp.identifier!.major > currentOp.identifier!.major) {
          // previousOp loses the battle
          loserMajor = previousOp.identifier!.major;
        } else {
          loserMajor = currentOp.identifier!.major;
        }

        loserCursorsMap[loserMajor.toString()] = true;

        for (let j = 0; j < operations.length; j++) {
          if (operations[j].identifier!.major === loserMajor) {
            operations.splice(j, 1);
            if (j < i) {
              i--;
            }
            j--;
          }
        }

        if (i > 0) {
          i--;
        }
      }
    }

    return loserCursorsMap;
  }
}
