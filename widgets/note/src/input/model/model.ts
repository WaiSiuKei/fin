import { Range } from '../core/range';

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
