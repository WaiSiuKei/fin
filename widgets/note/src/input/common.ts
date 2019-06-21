// export enum InputState {
//   IDLE = 0x00,
//   PlainText = 0x01,
//
//   BlodText = 0x100,
//   ItalicText = 0x110,
// }
//
// export function isInEmphasisMode(state: InputState) {
//   return state & 0x100;
// }
//
// export function isInPlainTextMode(state: InputState) {
//   return state & 0x01;
// }

import { IDimension } from './core/dimension';
import { IEditorOptions, InternalEditorOptions } from './config/editorOptions';
import { IIdentifiedSingleEditOperation, ITextModel } from './model/model';
import { Range } from './core/range';
import { Selection } from './core/selection';

/**
 * A builder and helper for edit operations for a command.
 */
export interface IEditOperationBuilder {
  /**
   * Add a new edit operation (a replace operation).
   * @param range The range to replace (delete). May be empty to represent a simple insert.
   * @param text The text to replace with. May be null to represent a simple delete.
   */
  addEditOperation(range: Range, text: string | null): void;

  /**
   * Add a new edit operation (a replace operation).
   * The inverse edits will be accessible in `ICursorStateComputerData.getInverseEditOperations()`
   * @param range The range to replace (delete). May be empty to represent a simple insert.
   * @param text The text to replace with. May be null to represent a simple delete.
   */
  addTrackedEditOperation(range: Range, text: string | null): void;

  /**
   * Track `selection` when applying edit operations.
   * A best effort will be made to not grow/expand the selection.
   * An empty selection will clamp to a nearby character.
   * @param selection The selection to track.
   * @param trackPreviousOnEmpty If set, and the selection is empty, indicates whether the selection
   *           should clamp to the previous or the next character.
   * @return A unique identifier.
   */
  trackSelection(selection: Selection, trackPreviousOnEmpty?: boolean): string;
}

/**
 * A helper for computing cursor state after a command.
 */
export interface ICursorStateComputerData {
  /**
   * Get the inverse edit operations of the added edit operations.
   */
  getInverseEditOperations(): IIdentifiedSingleEditOperation[];
  /**
   * Get a previously tracked selection.
   * @param id The unique identifier returned by `trackSelection`.
   * @return The selection.
   */
  getTrackedSelection(id: string): Selection;
}

export interface IConfiguration {

  readonly editor: InternalEditorOptions;

  setMaxLineNumber?(maxLineNumber: number): void;
  updateOptions?(newOptions: IEditorOptions): void;
  getRawOptions?(): IEditorOptions;
  observeReferenceElement?(dimension?: IDimension): void;
  setIsDominatedByLongLines?(isDominatedByLongLines: boolean): void;
}

/**
 * Built-in commands.
 * @internal
 */
export const Handler = {
  // ExecuteCommand: 'executeCommand',
  // ExecuteCommands: 'executeCommands',

  Type: 'type',
  // ReplacePreviousChar: 'replacePreviousChar',
  // CompositionStart: 'compositionStart',
  // CompositionEnd: 'compositionEnd',
  // Paste: 'paste',
  //
  // Cut: 'cut',
  //
  // Undo: 'undo',
  // Redo: 'redo',
};

/**
 * A command that modifies text / cursor state on a model.
 */
export interface ICommand {

  /**
   * Signal that this command is inserting automatic whitespace that should be trimmed if possible.
   * @internal
   */
  readonly insertsAutoWhitespace?: boolean;

  /**
   * Get the edit operations needed to execute this command.
   * @param model The model the command will execute on.
   * @param builder A helper to collect the needed edit operations and to track selections.
   */
  getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;

  /**
   * Compute the cursor state after the edit operations were applied.
   * @param model The model the command has executed on.
   * @param helper A helper to get inverse edit operations and to get previously tracked selections.
   * @return The cursor state after the command executed.
   */
  computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
