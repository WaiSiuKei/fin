import { ICoordinatesConverter } from './viewModel';
import { ITextModel } from '../model/model';
import { Position } from '../core/position';
import { Range } from '../core/range';

export interface IViewModelLinesCollection {
  createCoordinatesConverter(): ICoordinatesConverter;

  dispose(): void;
  //
  // setWrappingSettings(wrappingIndent: WrappingIndent, wrappingColumn: number, columnsForFullWidthChar: number): boolean;
  // setTabSize(newTabSize: number): boolean;
  // setHiddenAreas(_ranges: Range[]): boolean;
  //
  // onModelFlushed(): void;
  // onModelLinesDeleted(versionId: number, fromLineNumber: number, toLineNumber: number): viewEvents.ViewLinesDeletedEvent;
  // onModelLinesInserted(versionId: number, fromLineNumber: number, toLineNumber: number, text: string[]): viewEvents.ViewLinesInsertedEvent;
  // onModelLineChanged(versionId: number, lineNumber: number, newText: string): [boolean, viewEvents.ViewLinesChangedEvent, viewEvents.ViewLinesInsertedEvent, viewEvents.ViewLinesDeletedEvent];
  // acceptVersionId(versionId: number): void;
  //
  // getViewLineCount(): number;
  // warmUpLookupCache(viewStartLineNumber: number, viewEndLineNumber: number): void;
  // getViewLinesIndentGuides(viewStartLineNumber: number, viewEndLineNumber: number): number[];
  // getViewLineContent(viewLineNumber: number): string;
  // getViewLineMinColumn(viewLineNumber: number): number;
  // getViewLineMaxColumn(viewLineNumber: number): number;
  // getViewLineData(viewLineNumber: number): ViewLineData;
  // getViewLinesData(viewStartLineNumber: number, viewEndLineNumber: number, needed: boolean[]): ViewLineData[];
  //
  // getAllOverviewRulerDecorations(ownerId: number, filterOutValidation: boolean, theme: ITheme): IOverviewRulerDecorations;
  // getDecorationsInRange(range: Range, ownerId: number, filterOutValidation: boolean): IModelDecoration[];
}

export class IdentityCoordinatesConverter implements ICoordinatesConverter {

  private readonly _lines: IdentityLinesCollection;

  constructor(lines: IdentityLinesCollection) {
    this._lines = lines;
  }

  private _validPosition(pos: Position): Position {
    return this._lines.model.validatePosition(pos);
  }

  private _validRange(range: Range): Range {
    return this._lines.model.validateRange(range);
  }

  // View -> Model conversion and related methods

  public convertViewPositionToModelPosition(viewPosition: Position): Position {
    return this._validPosition(viewPosition);
  }

  public convertViewRangeToModelRange(viewRange: Range): Range {
    return this._validRange(viewRange);
  }

  public validateViewPosition(viewPosition: Position, expectedModelPosition: Position): Position {
    return this._validPosition(expectedModelPosition);
  }

  public validateViewRange(viewRange: Range, expectedModelRange: Range): Range {
    return this._validRange(expectedModelRange);
  }

  // Model -> View conversion and related methods

  public convertModelPositionToViewPosition(modelPosition: Position): Position {
    return this._validPosition(modelPosition);
  }

  public convertModelRangeToViewRange(modelRange: Range): Range {
    return this._validRange(modelRange);
  }

  public modelPositionIsVisible(modelPosition: Position): boolean {
    const lineCount = this._lines.model.getLineCount();
    if (modelPosition.lineNumber < 1 || modelPosition.lineNumber > lineCount) {
      // invalid arguments
      return false;
    }
    return true;
  }

}

export class IdentityLinesCollection implements IViewModelLinesCollection {

  public readonly model: ITextModel;

  constructor(model: ITextModel) {
    this.model = model;
  }

  public dispose(): void {
  }

  public createCoordinatesConverter(): ICoordinatesConverter {
    return new IdentityCoordinatesConverter(this);
  }

  // public setHiddenAreas(_ranges: Range[]): boolean {
  //   return false;
  // }
  //
  // public setTabSize(newTabSize: number): boolean {
  //   return false;
  // }
  //
  // public setWrappingSettings(wrappingIndent: WrappingIndent, wrappingColumn: number, columnsForFullWidthChar: number): boolean {
  //   return false;
  // }
  //
  // public onModelFlushed(): void {
  // }
  //
  // public onModelLinesDeleted(versionId: number, fromLineNumber: number, toLineNumber: number): viewEvents.ViewLinesDeletedEvent {
  //   return new viewEvents.ViewLinesDeletedEvent(fromLineNumber, toLineNumber);
  // }
  //
  // public onModelLinesInserted(versionId: number, fromLineNumber: number, toLineNumber: number, text: string[]): viewEvents.ViewLinesInsertedEvent {
  //   return new viewEvents.ViewLinesInsertedEvent(fromLineNumber, toLineNumber);
  // }
  //
  // public onModelLineChanged(versionId: number, lineNumber: number, newText: string): [boolean, viewEvents.ViewLinesChangedEvent, viewEvents.ViewLinesInsertedEvent, viewEvents.ViewLinesDeletedEvent] {
  //   return [false, new viewEvents.ViewLinesChangedEvent(lineNumber, lineNumber), null, null];
  // }
  //
  // public acceptVersionId(versionId: number): void {
  // }
  //
  // public getViewLineCount(): number {
  //   return this.model.getLineCount();
  // }
  //
  // public warmUpLookupCache(viewStartLineNumber: number, viewEndLineNumber: number): void {
  // }
  //
  // public getViewLinesIndentGuides(viewStartLineNumber: number, viewEndLineNumber: number): number[] {
  //   const viewLineCount = viewEndLineNumber - viewStartLineNumber + 1;
  //   let result = new Array<number>(viewLineCount);
  //   for (let i = 0; i < viewLineCount; i++) {
  //     result[i] = 0;
  //   }
  //   return result;
  // }
  //
  // public getViewLineContent(viewLineNumber: number): string {
  //   return this.model.getLineContent(viewLineNumber);
  // }
  //
  // public getViewLineMinColumn(viewLineNumber: number): number {
  //   return this.model.getLineMinColumn(viewLineNumber);
  // }
  //
  // public getViewLineMaxColumn(viewLineNumber: number): number {
  //   return this.model.getLineMaxColumn(viewLineNumber);
  // }
  //
  // public getViewLineData(viewLineNumber: number): ViewLineData {
  //   let lineTokens = this.model.getLineTokens(viewLineNumber);
  //   let lineContent = lineTokens.getLineContent();
  //   return new ViewLineData(
  //     lineContent,
  //     1,
  //     lineContent.length + 1,
  //     lineTokens.inflate()
  //   );
  // }
  //
  // public getViewLinesData(viewStartLineNumber: number, viewEndLineNumber: number, needed: boolean[]): ViewLineData[] {
  //   const lineCount = this.model.getLineCount();
  //   viewStartLineNumber = Math.min(Math.max(1, viewStartLineNumber), lineCount);
  //   viewEndLineNumber = Math.min(Math.max(1, viewEndLineNumber), lineCount);
  //
  //   let result: ViewLineData[] = [];
  //   for (let lineNumber = viewStartLineNumber; lineNumber <= viewEndLineNumber; lineNumber++) {
  //     let idx = lineNumber - viewStartLineNumber;
  //     if (!needed[idx]) {
  //       result[idx] = null;
  //     }
  //     result[idx] = this.getViewLineData(lineNumber);
  //   }
  //
  //   return result;
  // }
  //
  // public getAllOverviewRulerDecorations(ownerId: number, filterOutValidation: boolean, theme: ITheme): IOverviewRulerDecorations {
  //   const decorations = this.model.getOverviewRulerDecorations(ownerId, filterOutValidation);
  //   const result = new OverviewRulerDecorations();
  //   for (let i = 0, len = decorations.length; i < len; i++) {
  //     const decoration = decorations[i];
  //     const opts = <ModelDecorationOverviewRulerOptions>decoration.options.overviewRuler;
  //     const lane = opts.position;
  //     if (lane === 0) {
  //       continue;
  //     }
  //     const color = resolveColor(opts, theme);
  //     const viewStartLineNumber = decoration.range.startLineNumber;
  //     const viewEndLineNumber = decoration.range.endLineNumber;
  //
  //     result.accept(color, viewStartLineNumber, viewEndLineNumber, lane);
  //   }
  //   return result.result;
  // }
  //
  // public getDecorationsInRange(range: Range, ownerId: number, filterOutValidation: boolean): IModelDecoration[] {
  //   return this.model.getDecorationsInRange(range, ownerId, filterOutValidation);
  // }
}
