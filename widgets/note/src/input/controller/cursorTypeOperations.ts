import { ITextModel } from '../model/model';
import { Selection } from '../core/selection';
import { ICommand } from '../common';
import { CursorConfiguration, EditOperationResult, EditOperationType } from './cursorCommon';

export class TypeOperations {
  public static typeWithInterceptors(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string): EditOperationResult {

    if (ch === '\n') {
      let commands: ICommand[] = [];
      for (let i = 0, len = selections.length; i < len; i++) {
        commands[i] = TypeOperations._enter(config, model, false, selections[i]);
      }
      return new EditOperationResult(EditOperationType.Typing, commands, {
        shouldPushStackElementBefore: true,
        shouldPushStackElementAfter: false,
      });
    }

    if (this._isAutoIndentType(config, model, selections)) {
      let commands: Array<ICommand | null> = [];
      let autoIndentFails = false;
      for (let i = 0, len = selections.length; i < len; i++) {
        commands[i] = this._runAutoIndentType(config, model, selections[i], ch);
        if (!commands[i]) {
          autoIndentFails = true;
          break;
        }
      }
      if (!autoIndentFails) {
        return new EditOperationResult(EditOperationType.Typing, commands, {
          shouldPushStackElementBefore: true,
          shouldPushStackElementAfter: false,
        });
      }
    }

    if (this._isAutoClosingCloseCharType(config, model, selections, ch)) {
      return this._runAutoClosingCloseCharType(prevEditOperationType, config, model, selections, ch);
    }

    if (this._isAutoClosingOpenCharType(config, model, selections, ch)) {
      return this._runAutoClosingOpenCharType(prevEditOperationType, config, model, selections, ch);
    }

    if (this._isSurroundSelectionType(config, model, selections, ch)) {
      return this._runSurroundSelectionType(prevEditOperationType, config, model, selections, ch);
    }

    // Electric characters make sense only when dealing with a single cursor,
    // as multiple cursors typing brackets for example would interfer with bracket matching
    if (this._isTypeInterceptorElectricChar(config, model, selections)) {
      const r = this._typeInterceptorElectricChar(prevEditOperationType, config, model, selections[0], ch);
      if (r) {
        return r;
      }
    }

    // A simple character type
    let commands: ICommand[] = [];
    for (let i = 0, len = selections.length; i < len; i++) {
      commands[i] = new ReplaceCommand(selections[i], ch);
    }
    let shouldPushStackElementBefore = (prevEditOperationType !== EditOperationType.Typing);
    if (ch === ' ') {
      shouldPushStackElementBefore = true;
    }
    return new EditOperationResult(EditOperationType.Typing, commands, {
      shouldPushStackElementBefore: shouldPushStackElementBefore,
      shouldPushStackElementAfter: false
    });
  }

  public static typeWithoutInterceptors(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], str: string): EditOperationResult {
    let commands: ICommand[] = [];
    for (let i = 0, len = selections.length; i < len; i++) {
      commands[i] = new ReplaceCommand(selections[i], str);
    }
    return new EditOperationResult(EditOperationType.Typing, commands, {
      shouldPushStackElementBefore: (prevEditOperationType !== EditOperationType.Typing),
      shouldPushStackElementAfter: false
    });
  }
}
