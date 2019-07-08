import { createFastDomNode } from '@fin/dom';
import { IVisibleLine } from '../../view/viewLayer';
import { IConfiguration } from '../../common';

export class ViewLineOptions {
  public readonly renderWhitespace: 'none' | 'boundary' | 'all';
  public readonly spaceWidth: number;
  public readonly lineHeight: number;
  public readonly stopRenderingLineAfter: number;
  public readonly fontLigatures: boolean;

  constructor(config: IConfiguration) {
    this.renderWhitespace = 'none';
    this.spaceWidth = config.editor.fontInfo.spaceWidth;
    this.lineHeight = config.editor.lineHeight;
    this.stopRenderingLineAfter = config.editor.viewInfo.stopRenderingLineAfter;
  }

  public equals(other: ViewLineOptions): boolean {
    return (
      this.renderWhitespace === other.renderWhitespace
      && this.spaceWidth === other.spaceWidth
      && this.lineHeight === other.lineHeight
      && this.stopRenderingLineAfter === other.stopRenderingLineAfter
    );
  }
}

export class ViewLine implements IVisibleLine {

  public static readonly CLASS_NAME = 'view-line';

  private _options: ViewLineOptions;
  private _isMaybeInvalid: boolean;
  private _renderedViewLine: IRenderedViewLine;

  constructor(options: ViewLineOptions) {
    this._options = options;
    this._isMaybeInvalid = true;
    this._renderedViewLine = null;
  }

  // --- begin IVisibleLineData

  public getDomNode(): HTMLElement {
    if (this._renderedViewLine && this._renderedViewLine.domNode) {
      return this._renderedViewLine.domNode.domNode;
    }
    return null;
  }
  public setDomNode(domNode: HTMLElement): void {
    if (this._renderedViewLine) {
      this._renderedViewLine.domNode = createFastDomNode(domNode);
    } else {
      throw new Error('I have no rendered view line to set the dom node to...');
    }
  }

  public onContentChanged(): void {
    this._isMaybeInvalid = true;
  }
  public onTokensChanged(): void {
    this._isMaybeInvalid = true;
  }
  public onDecorationsChanged(): void {
    this._isMaybeInvalid = true;
  }
  public onOptionsChanged(newOptions: ViewLineOptions): void {
    this._isMaybeInvalid = true;
    this._options = newOptions;
  }
  public onSelectionChanged(): boolean {
    if (alwaysRenderInlineSelection || this._options.themeType === HIGH_CONTRAST) {
      this._isMaybeInvalid = true;
      return true;
    }
    return false;
  }

  public renderLine(lineNumber: number, deltaTop: number, viewportData: ViewportData, sb: IStringBuilder): boolean {
    if (this._isMaybeInvalid === false) {
      // it appears that nothing relevant has changed
      return false;
    }

    this._isMaybeInvalid = false;

    const lineData = viewportData.getViewLineRenderingData(lineNumber);
    const options = this._options;
    const actualInlineDecorations = LineDecoration.filter(lineData.inlineDecorations, lineNumber, lineData.minColumn, lineData.maxColumn);

    if (alwaysRenderInlineSelection || options.themeType === HIGH_CONTRAST) {
      const selections = viewportData.selections;
      for (let i = 0, len = selections.length; i < len; i++) {
        const selection = selections[i];

        if (selection.endLineNumber < lineNumber || selection.startLineNumber > lineNumber) {
          // Selection does not intersect line
          continue;
        }

        let startColumn = (selection.startLineNumber === lineNumber ? selection.startColumn : lineData.minColumn);
        let endColumn = (selection.endLineNumber === lineNumber ? selection.endColumn : lineData.maxColumn);

        if (startColumn < endColumn) {
          actualInlineDecorations.push(new LineDecoration(startColumn, endColumn, 'inline-selected-text', InlineDecorationType.Regular));
        }
      }
    }

    let renderLineInput = new RenderLineInput(
      options.useMonospaceOptimizations,
      lineData.content,
      lineData.mightContainRTL,
      lineData.minColumn - 1,
      lineData.tokens,
      actualInlineDecorations,
      lineData.tabSize,
      options.spaceWidth,
      options.stopRenderingLineAfter,
      options.renderWhitespace,
      options.renderControlCharacters,
      options.fontLigatures
    );

    if (this._renderedViewLine && this._renderedViewLine.input.equals(renderLineInput)) {
      // no need to do anything, we have the same render input
      return false;
    }

    sb.appendASCIIString('<div style="top:');
    sb.appendASCIIString(String(deltaTop));
    sb.appendASCIIString('px;height:');
    sb.appendASCIIString(String(this._options.lineHeight));
    sb.appendASCIIString('px;" class="');
    sb.appendASCIIString(ViewLine.CLASS_NAME);
    sb.appendASCIIString('">');

    const output = renderViewLine(renderLineInput, sb);

    sb.appendASCIIString('</div>');

    let renderedViewLine: IRenderedViewLine = null;
    if (canUseFastRenderedViewLine && options.useMonospaceOptimizations && !output.containsForeignElements) {
      let isRegularASCII = true;
      if (lineData.mightContainNonBasicASCII) {
        isRegularASCII = strings.isBasicASCII(lineData.content);
      }

      if (isRegularASCII && lineData.content.length < 1000) {
        // Browser rounding errors have been observed in Chrome and IE, so using the fast
        // view line only for short lines. Please test before removing the length check...
        renderedViewLine = new FastRenderedViewLine(
          this._renderedViewLine ? this._renderedViewLine.domNode : null,
          renderLineInput,
          output.characterMapping
        );
      }
    }

    if (!renderedViewLine) {
      renderedViewLine = createRenderedLine(
        this._renderedViewLine ? this._renderedViewLine.domNode : null,
        renderLineInput,
        output.characterMapping,
        output.containsRTL,
        output.containsForeignElements
      );
    }

    this._renderedViewLine = renderedViewLine;

    return true;
  }

  public layoutLine(lineNumber: number, deltaTop: number): void {
    if (this._renderedViewLine && this._renderedViewLine.domNode) {
      this._renderedViewLine.domNode.setTop(deltaTop);
      this._renderedViewLine.domNode.setHeight(this._options.lineHeight);
    }
  }

  // --- end IVisibleLineData

  public getWidth(): number {
    if (!this._renderedViewLine) {
      return 0;
    }
    return this._renderedViewLine.getWidth();
  }

  public getWidthIsFast(): boolean {
    if (!this._renderedViewLine) {
      return true;
    }
    return this._renderedViewLine.getWidthIsFast();
  }

  public getVisibleRangesForRange(startColumn: number, endColumn: number, context: DomReadingContext): HorizontalRange[] {
    startColumn = Math.min(this._renderedViewLine.input.lineContent.length + 1, Math.max(1, startColumn));
    endColumn = Math.min(this._renderedViewLine.input.lineContent.length + 1, Math.max(1, endColumn));
    return this._renderedViewLine.getVisibleRangesForRange(startColumn, endColumn, context);
  }

  public getColumnOfNodeOffset(lineNumber: number, spanNode: HTMLElement, offset: number): number {
    return this._renderedViewLine.getColumnOfNodeOffset(lineNumber, spanNode, offset);
  }
}
