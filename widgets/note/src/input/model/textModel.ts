import { DefaultEndOfLine, EndOfLineSequence, ICursorStateComputer, IIdentifiedSingleEditOperation, ITextBuffer, ITextBufferFactory, ITextModel, TrackedRangeStickiness } from './model';
import { Disposable } from '@fin/disposable';
import { IRange, Range } from '../core/range';
import { Selection } from '../core/selection';
import { IPosition, Position } from '../core/position';
import { EditStack } from './editStack';
import { isHighSurrogate } from '@fin/strings';
import { LinesTextBufferBuilder } from './linesTextBuffer/linesTextBufferBuilder';

// Here is the master switch for the text buffer implementation:
function createTextBufferBuilder() {
  return new LinesTextBufferBuilder();
}

export function createTextBufferFactory(text: string): ITextBufferFactory {
  const builder = createTextBufferBuilder();
  builder.acceptChunk(text);
  return builder.finish();
}

export function createTextBuffer(value: string | ITextBufferFactory, defaultEOL: DefaultEndOfLine): ITextBuffer {
  const factory = (typeof value === 'string' ? createTextBufferFactory(value) : value);
  return factory.create(defaultEOL);
}

export class TextModel extends Disposable implements ITextModel {

  private _isDisposed: boolean;
  private _isDisposing: boolean;
  private _versionId: number;
  private _buffer: ITextBuffer;
  /**
   * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
   */
  private _alternativeVersionId: number;

  //#region Editing
  private _commandManager: EditStack;
  private _isUndoing: boolean;
  private _isRedoing: boolean;
  //#endregion

  constructor(source: string) {
    super();

    this._setVersionId(1);
    this._isDisposed = false;
    this._isDisposing = false;

    this._buffer = createTextBuffer(source, DefaultEndOfLine.LF);

    this._commandManager = new EditStack(this);
    this._isUndoing = false;
    this._isRedoing = false;
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

  public applyEdits(rawOperations: IIdentifiedSingleEditOperation[]): IIdentifiedSingleEditOperation[] {
    for (let i = 0, len = rawOperations.length; i < len; i++) {
      rawOperations[i].range = this.validateRange(rawOperations[i].range);
    }
    const result = this._buffer.applyEdits(rawOperations, false);
    const rawContentChanges = result.rawChanges;
    const contentChanges = result.changes;

    return result.reverseEdits;
  }

  public setEOL(eol: EndOfLineSequence): void {
    const newEOL = (eol === EndOfLineSequence.CRLF ? '\r\n' : '\n');
    if (this._buffer.getEOL() === newEOL) {
      // Nothing to do
      return;
    }

    this._buffer.setEOL(newEOL);
    this._increaseVersionId();
  }

  public pushEditOperations(beforeCursorState: Selection[], editOperations: IIdentifiedSingleEditOperation[], cursorStateComputer: ICursorStateComputer | null): Selection[] | null {
    return this._commandManager.pushEditOperation(beforeCursorState, editOperations, cursorStateComputer);
  }

  private _increaseVersionId(): void {
    this._setVersionId(this._versionId + 1);
  }

  private _setVersionId(newVersionId: number): void {
    this._versionId = newVersionId;
    this._alternativeVersionId = this._versionId;
  }

  public getVersionId(): number {
    return this._versionId;
  }

  public getAlternativeVersionId(): number {
    return this._alternativeVersionId;
  }
  /**
   * @param strict Do NOT allow a position inside a high-low surrogate pair
   */
  private _validatePosition(_lineNumber: number, _column: number, strict: boolean): Position {
    const lineNumber = Math.floor(typeof _lineNumber === 'number' ? _lineNumber : 1);
    const column = Math.floor(typeof _column === 'number' ? _column : 1);
    const lineCount = this._buffer.getLineCount();

    if (lineNumber < 1) {
      return new Position(1, 1);
    }

    if (lineNumber > lineCount) {
      return new Position(lineCount, this.getLineMaxColumn(lineCount));
    }

    if (column <= 1) {
      return new Position(lineNumber, 1);
    }

    const maxColumn = this.getLineMaxColumn(lineNumber);
    if (column >= maxColumn) {
      return new Position(lineNumber, maxColumn);
    }

    if (strict) {
      // If the position would end up in the middle of a high-low surrogate pair,
      // we move it to before the pair
      // !!At this point, column > 1
      const charCodeBefore = this._buffer.getLineCharCode(lineNumber, column - 2);
      if (isHighSurrogate(charCodeBefore)) {
        return new Position(lineNumber, column - 1);
      }
    }

    return new Position(lineNumber, column);
  }

  public validatePosition(position: IPosition): Position {
    return this._validatePosition(position.lineNumber, position.column, true);
  }

  public validateRange(_range: IRange): Range {
    const start = this._validatePosition(_range.startLineNumber, _range.startColumn, false);
    const end = this._validatePosition(_range.endLineNumber, _range.endColumn, false);

    const startLineNumber = start.lineNumber;
    const startColumn = start.column;
    const endLineNumber = end.lineNumber;
    const endColumn = end.column;

    const charCodeBeforeStart = (startColumn > 1 ? this._buffer.getLineCharCode(startLineNumber, startColumn - 2) : 0);
    const charCodeBeforeEnd = (endColumn > 1 && endColumn <= this._buffer.getLineLength(endLineNumber) ? this._buffer.getLineCharCode(endLineNumber, endColumn - 2) : 0);

    const startInsideSurrogatePair = isHighSurrogate(charCodeBeforeStart);
    const endInsideSurrogatePair = isHighSurrogate(charCodeBeforeEnd);

    if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
      return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }

    if (startLineNumber === endLineNumber && startColumn === endColumn) {
      // do not expand a collapsed range, simply move it to a valid location
      return new Range(startLineNumber, startColumn - 1, endLineNumber, endColumn - 1);
    }

    if (startInsideSurrogatePair && endInsideSurrogatePair) {
      // expand range at both ends
      return new Range(startLineNumber, startColumn - 1, endLineNumber, endColumn + 1);
    }

    if (startInsideSurrogatePair) {
      // only expand range at the start
      return new Range(startLineNumber, startColumn - 1, endLineNumber, endColumn);
    }

    // only expand range at the end
    return new Range(startLineNumber, startColumn, endLineNumber, endColumn + 1);
  }

  public getLineMaxColumn(lineNumber: number): number {
    if (lineNumber < 1 || lineNumber > this.getLineCount()) {
      throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
    }
    return this._buffer.getLineLength(lineNumber) + 1;
  }

  public getLineCount(): number {
    return this._buffer.getLineCount();
  }
}
