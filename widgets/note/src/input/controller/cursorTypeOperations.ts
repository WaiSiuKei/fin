import { ITextModel } from '../model/model';
import { Selection } from '../core/selection';
import { ICommand } from '../common';
import { Range } from '../core/range';
import { CursorConfiguration, EditOperationResult, EditOperationType } from './cursorCommon';
import { ReplaceCommand, ReplaceCommandWithoutChangingPosition } from '../commands/replaceCommand';

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

  private static _enter(config: CursorConfiguration, model: ITextModel, keepPosition: boolean, range: Range): ICommand {
    // Nothing special
    return TypeOperations._typeCommand(range, '\n', keepPosition);
  }

  private static _typeCommand(range: Range, text: string, keepPosition: boolean): ICommand {
    if (keepPosition) {
      return new ReplaceCommandWithoutChangingPosition(range, text, true);
    } else {
      return new ReplaceCommand(range, text, true);
    }
  }
}
