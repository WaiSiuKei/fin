import { IConfiguration } from '../common';
import { IViewModel } from '../viewModel/viewModel';

// export interface IMouseDispatchData {
//   position: Position;
//   /**
//    * Desired mouse column (e.g. when position.column gets clamped to text length -- clicking after text on a line).
//    */
//   mouseColumn: number;
//   startedOnLineNumbers: boolean;
//
//   inSelectionMode: boolean;
//   mouseDownCount: number;
//   altKey: boolean;
//   ctrlKey: boolean;
//   metaKey: boolean;
//   shiftKey: boolean;
//
//   leftButton: boolean;
//   middleButton: boolean;
// }

export interface ICommandDelegate {

  // paste?(source: string, text: string, pasteOnNewLine: boolean, multicursorText: string[] | null): void;
  type(source: string, text: string): void;
  // replacePreviousChar?(source: string, text: string, replaceCharCnt: number): void;
  // compositionStart?(source: string): void;
  // compositionEnd?(source: string): void;
  // cut?(source: string): void;
}

export class ViewController {

  private readonly configuration: IConfiguration;
  private readonly viewModel: IViewModel;
  private readonly commandDelegate: ICommandDelegate;

  constructor(
    configuration: IConfiguration,
    viewModel: IViewModel,
    commandDelegate: ICommandDelegate
  ) {
    this.configuration = configuration;
    this.viewModel = viewModel;
    this.commandDelegate = commandDelegate;
  }

  // public paste(source: string, text: string, pasteOnNewLine: boolean, multicursorText: string[] | null): void {
  //   this.commandDelegate.paste(source, text, pasteOnNewLine, multicursorText);
  // }

  public type(source: string, text: string): void {
    this.commandDelegate.type(source, text);
  }

  // public replacePreviousChar(source: string, text: string, replaceCharCnt: number): void {
  //   this.commandDelegate.replacePreviousChar(source, text, replaceCharCnt);
  // }

  // public compositionStart(source: string): void {
  //   this.commandDelegate.compositionStart(source);
  // }

  // public compositionEnd(source: string): void {
  //   this.commandDelegate.compositionEnd(source);
  // }

  // public cut(source: string): void {
  //   this.commandDelegate.cut(source);
  // }
}
