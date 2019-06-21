import { IDisposable } from '@fin/disposable';
import { Position } from '../core/position';
import { Range } from '../core/range';

export interface IViewLayout {
}

export interface ICoordinatesConverter {
  // View -> Model conversion and related methods
  convertViewPositionToModelPosition(viewPosition: Position): Position;
  convertViewRangeToModelRange(viewRange: Range): Range;
  validateViewPosition(viewPosition: Position, expectedModelPosition: Position): Position;
  validateViewRange(viewRange: Range, expectedModelRange: Range): Range;

  // Model -> View conversion and related methods
  convertModelPositionToViewPosition(modelPosition: Position): Position;
  convertModelRangeToViewRange(modelRange: Range): Range;
  modelPositionIsVisible(modelPosition: Position): boolean;
}

export interface IViewModel {

  // readonly coordinatesConverter: ICoordinatesConverter;

  readonly viewLayout: IViewLayout;

  /**
   * Gives a hint that a lot of requests are about to come in for these line numbers.
   */
  // setViewport(startLineNumber: number, endLineNumber: number, centeredLineNumber: number): void;
  // tokenizeViewport(): void;
  // setHasFocus(hasFocus: boolean): void;
  //
  // getDecorationsInViewport(visibleRange: Range): ViewModelDecoration[];
  // getViewLineRenderingData(visibleRange: Range, lineNumber: number): ViewLineRenderingData;
  // getViewLineData(lineNumber: number): ViewLineData;
  // getMinimapLinesRenderingData(startLineNumber: number, endLineNumber: number, needed: boolean[]): MinimapLinesRenderingData;
  // getCompletelyVisibleViewRange(): Range;
  // getCompletelyVisibleViewRangeAtScrollTop(scrollTop: number): Range;
  //
  // getOptions(): TextModelResolvedOptions;
  // getLineCount(): number;
  // getLineContent(lineNumber: number): string;
  // getLineLength(lineNumber: number): number;
  // getActiveIndentGuide(lineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
  // getLinesIndentGuides(startLineNumber: number, endLineNumber: number): number[];
  // getLineMinColumn(lineNumber: number): number;
  // getLineMaxColumn(lineNumber: number): number;
  // getLineFirstNonWhitespaceColumn(lineNumber: number): number;
  // getLineLastNonWhitespaceColumn(lineNumber: number): number;
  // getAllOverviewRulerDecorations(theme: ITheme): IOverviewRulerDecorations;
  // invalidateOverviewRulerColorCache(): void;
  // getValueInRange(range: Range, eol: EndOfLinePreference): string;
  //
  // getModelLineMaxColumn(modelLineNumber: number): number;
  // validateModelPosition(modelPosition: IPosition): Position;
  // validateModelRange(range: IRange): Range;
  //
  // deduceModelPositionRelativeToViewPosition(viewAnchorPosition: Position, deltaOffset: number, lineFeedCnt: number): Position;
  // getEOL(): string;
  // getPlainTextToCopy(ranges: Range[], emptySelectionClipboard: boolean, forceCRLF: boolean): string | string[];
  // getHTMLToCopy(ranges: Range[], emptySelectionClipboard: boolean): string | null;
}
