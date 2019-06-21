import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../common';
import { ITextModel } from '../model/model';
import { Range } from '../core/range';
import { Selection } from '../core/selection';

export class ReplaceCommand implements ICommand {

  private readonly _range: Range;
  private readonly _text: string;
  public readonly insertsAutoWhitespace: boolean;

  constructor(range: Range, text: string, insertsAutoWhitespace: boolean = false) {
    this._range = range;
    this._text = text;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }

  public getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void {
    builder.addTrackedEditOperation(this._range, this._text);
  }

  public computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection {
    let inverseEditOperations = helper.getInverseEditOperations();
    let srcRange = inverseEditOperations[0].range;
    return new Selection(
      srcRange.endLineNumber,
      srcRange.endColumn,
      srcRange.endLineNumber,
      srcRange.endColumn
    );
  }
}


export class ReplaceCommandWithoutChangingPosition implements ICommand {

  private readonly _range: Range;
  private readonly _text: string;
  public readonly insertsAutoWhitespace: boolean;

  constructor(range: Range, text: string, insertsAutoWhitespace: boolean = false) {
    this._range = range;
    this._text = text;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }

  public getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void {
    builder.addTrackedEditOperation(this._range, this._text);
  }

  public computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection {
    let inverseEditOperations = helper.getInverseEditOperations();
    let srcRange = inverseEditOperations[0].range;
    return new Selection(
      srcRange.startLineNumber,
      srcRange.startColumn,
      srcRange.startLineNumber,
      srcRange.startColumn
    );
  }
}

