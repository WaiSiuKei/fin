import { ViewPart } from '../../view/viewPart';
import { FastDomNode } from '@fin/dom';
import { RunOnceScheduler } from '@fin/async';
import { ViewLine, ViewLineOptions } from './viewLine';
import { ViewContext } from '../../view/viewContext';
import { IVisibleLinesHost, VisibleLinesCollection } from '../../view/viewLayer';
import { IViewLines } from '../../view/renderingContext';

export class ViewLines extends ViewPart implements IVisibleLinesHost<ViewLine>, IViewLines {
  /**
   * Adds this ammount of pixels to the right of lines (no-one wants to type near the edge of the viewport)
   */

  private readonly _linesContent: FastDomNode<HTMLElement>;
  private readonly _textRangeRestingSpot: HTMLElement;
  private readonly _visibleLines: VisibleLinesCollection<ViewLine>;
  private readonly domNode: FastDomNode<HTMLElement>;

  // --- config
  private _lineHeight: number;
  private _typicalHalfwidthCharacterWidth: number;
  private _isViewportWrapping: boolean;
  private _revealHorizontalRightPadding: number;
  private _viewLineOptions: ViewLineOptions;

  // --- width
  private _maxLineWidth: number;
  private _asyncUpdateLineWidths: RunOnceScheduler;

  // private _lastRenderedData: LastRenderedData;

  constructor(context: ViewContext, linesContent: FastDomNode<HTMLElement>) {
    super(context);
    this._linesContent = linesContent;
    this._textRangeRestingSpot = document.createElement('div');
    this._visibleLines = new VisibleLinesCollection(this);
    this.domNode = this._visibleLines.domNode;

    const conf = this._context.configuration;

    this._lineHeight = conf.editor.lineHeight;
    this._typicalHalfwidthCharacterWidth = 1;
    this._isViewportWrapping = true;
    this._revealHorizontalRightPadding = 20; // fixme
    this._viewLineOptions = new ViewLineOptions(conf);

    this.domNode.setClassName('view-lines');

    // --- width & height
    this._maxLineWidth = 0;
    this._asyncUpdateLineWidths = new RunOnceScheduler(() => {
      this._updateLineWidthsSlow();
    }, 200);

    // this._lastRenderedData = new LastRenderedData();
  }

  public dispose(): void {
    this._asyncUpdateLineWidths.dispose();
    super.dispose();
  }

  public getDomNode(): FastDomNode<HTMLElement> {
    return this.domNode;
  }

  public createVisibleLine(): ViewLine {
    return new ViewLine(this._viewLineOptions);
  }

  /**
   * Updates the max line width if it is fast to compute.
   * Returns true if all lines were taken into account.
   * Returns false if some lines need to be reevaluated (in a slow fashion).
   */
  private _updateLineWidthsSlow(): void {
    this._updateLineWidths(false);
  }

  private _updateLineWidths(fast: boolean): boolean {
    const rendStartLineNumber = this._visibleLines.getStartLineNumber();
    const rendEndLineNumber = this._visibleLines.getEndLineNumber();

    let localMaxLineWidth = 1;
    let allWidthsComputed = true;
    for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
      const visibleLine = this._visibleLines.getVisibleLine(lineNumber);

      if (fast && !visibleLine.getWidthIsFast()) {
        // Cannot compute width in a fast way for this line
        allWidthsComputed = false;
        continue;
      }

      localMaxLineWidth = Math.max(localMaxLineWidth, visibleLine.getWidth());
    }

    if (allWidthsComputed && rendStartLineNumber === 1 && rendEndLineNumber === this._context.model.getLineCount()) {
      // we know the max line width for all the lines
      this._maxLineWidth = 0;
    }

    this._ensureMaxLineWidth(localMaxLineWidth);

    return allWidthsComputed;
  }

  public prepareRender(): void {
    throw new Error('Not supported');
  }

  public render(): void {
    throw new Error('Not supported');
  }

  // --- width

  private _ensureMaxLineWidth(lineWidth: number): void {
    let iLineWidth = Math.ceil(lineWidth);
    if (this._maxLineWidth < iLineWidth) {
      this._maxLineWidth = iLineWidth;
      // fixme
      // this._context.viewLayout.onMaxLineWidthChanged(this._maxLineWidth);
    }
  }
}
