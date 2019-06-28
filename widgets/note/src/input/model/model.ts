import { IRange, Range } from '../core/range';
import { IPosition, Position } from '../core/position';
import { Selection } from '../core/selection';
import { EndOfLinePreference } from '../model';
import { IModelContentChange, ModelRawChange } from './textModelEvents';

/**
 * A model.
 */
export interface ITextModel {
  /**
   * @internal
   */
  _getTrackedRange(id: string): Range | null;

  /**
   * @internal
   */
  _setTrackedRange(id: string | null, newRange: null, newStickiness: TrackedRangeStickiness): null;
  /**
   * @internal
   */
  _setTrackedRange(id: string | null, newRange: Range, newStickiness: TrackedRangeStickiness): string;

  /**
   * Get the number of lines in the model.
   */
  getLineCount(): number;
  /**
   * Create a valid range.
   */
  validateRange(range: IRange): Range;

  /**
   * Create a valid position,
   */
  validatePosition(position: IPosition): Position;

  /**
   * Push edit operations, basically editing the model. This is the preferred way
   * of editing the model. The edit operations will land on the undo stack.
   * @param beforeCursorState The cursor state before the edit operaions. This cursor state will be returned when `undo` or `redo` are invoked.
   * @param editOperations The edit operations.
   * @param cursorStateComputer A callback that can compute the resulting cursors state after the edit operations have been executed.
   * @return The cursor state returned by the `cursorStateComputer`.
   */
  pushEditOperations(beforeCursorState: Selection[], editOperations: IIdentifiedSingleEditOperation[], cursorStateComputer: ICursorStateComputer): Selection[];

  /**
   * Get the maximum legal column for line at `lineNumber`
   */
  getLineMaxColumn(lineNumber: number): number;
}

/**
 * An identifier for a single edit operation.
 */
export interface ISingleEditOperationIdentifier {
  /**
   * Identifier major
   */
  major: number;
  /**
   * Identifier minor
   */
  minor: number;
}

/**
 * A single edit operation, that has an identifier.
 */
export interface IIdentifiedSingleEditOperation {
  /**
   * An identifier associated with this single edit operation.
   * @internal
   */
  identifier?: ISingleEditOperationIdentifier | null;
  /**
   * The range to replace. This can be empty to emulate a simple insert.
   */
  range: Range;
  /**
   * The text to replace with. This can be null to emulate a simple delete.
   */
  text: string | null;
  /**
   * This indicates that this operation has "insert" semantics.
   * i.e. forceMoveMarkers = true => if `range` is collapsed, all markers at the position will be moved.
   */
  forceMoveMarkers?: boolean;
  /**
   * This indicates that this operation is inserting automatic whitespace
   * that can be removed on next model edit operation if `config.trimAutoWhitespace` is true.
   * @internal
   */
  isAutoWhitespaceEdit?: boolean;
  /**
   * This indicates that this operation is in a set of operations that are tracked and should not be "simplified".
   * @internal
   */
  _isTracked?: boolean;
}

/**
 * Describes the behavior of decorations when typing/editing near their edges.
 * Note: Please do not edit the values, as they very carefully match `DecorationRangeBehavior`
 */
export const enum TrackedRangeStickiness {
  AlwaysGrowsWhenTypingAtEdges = 0,
  NeverGrowsWhenTypingAtEdges = 1,
  GrowsOnlyWhenTypingBefore = 2,
  GrowsOnlyWhenTypingAfter = 3,
}

/**
 * A callback that can compute the cursor state after applying a series of edit operations.
 */
export interface ICursorStateComputer {
  /**
   * A callback that can compute the resulting cursors state after some edit operations have been executed.
   */
  (inverseEditOperations: IIdentifiedSingleEditOperation[]): Selection[] | null;
}

export const enum EndOfLineSequence {
  /**
   * Use line feed (\n) as the end of line character.
   */
  LF = 0,
  /**
   * Use carriage return and line feed (\r\n) as the end of line character.
   */
  CRLF = 1
}

export interface ITextBuffer {
  equals(other: ITextBuffer): boolean;
  mightContainRTL(): boolean;
  mightContainNonBasicASCII(): boolean;
  getBOM(): string;
  getEOL(): string;

  getOffsetAt(lineNumber: number, column: number): number;
  getPositionAt(offset: number): Position;
  getRangeAt(offset: number, length: number): Range;

  getValueInRange(range: Range, eol: EndOfLinePreference): string;
  getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
  getLineCount(): number;
  getLinesContent(): string[];
  getLineContent(lineNumber: number): string;
  getLineCharCode(lineNumber: number, index: number): number;
  getLineLength(lineNumber: number): number;
  getLineFirstNonWhitespaceColumn(lineNumber: number): number;
  getLineLastNonWhitespaceColumn(lineNumber: number): number;

  setEOL(newEOL: string): void;
  applyEdits(rawOperations: IIdentifiedSingleEditOperation[], recordTrimAutoWhitespace: boolean): ApplyEditsResult;
}

/**
 * @internal
 */
export class ApplyEditsResult {

  constructor(
    public readonly reverseEdits: IIdentifiedSingleEditOperation[],
    public readonly rawChanges: ModelRawChange[],
    public readonly changes: IInternalModelContentChange[],
    // public readonly trimAutoWhitespaceLineNumbers: number[]
  ) { }

}

/**
 * @internal
 */
export interface IInternalModelContentChange extends IModelContentChange {
  range: Range;
  lines: string[];
  rangeOffset: number;
  forceMoveMarkers: boolean;
}

/**
 * The default end of line to use when instantiating models.
 */
export const enum DefaultEndOfLine {
  /**
   * Use line feed (\n) as the end of line character.
   */
  LF = 1,
  /**
   * Use carriage return and line feed (\r\n) as the end of line character.
   */
  CRLF = 2
}

/**
 * @internal
 */
export interface ITextBufferFactory {
  create(defaultEOL: DefaultEndOfLine): ITextBuffer;
  getFirstLineText(lengthLimit: number): string;
}

/**
 * @internal
 */
export interface ITextBufferBuilder {
  acceptChunk(chunk: string): void;
  finish(): ITextBufferFactory;
}
