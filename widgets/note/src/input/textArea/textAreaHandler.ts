import { isEdgeOrIE, isFirefox, isWindows } from '@fin/platform';
import { Disposable } from '@fin/disposable';
import { createFastDomNode, FastDomNode } from '@fin/dom';
import { IPasteData, ITextAreaInputHost, TextAreaInput } from './textAreaInput';
import { ISimpleModel, ITypeData, TextAreaState } from './textAreaState';
import { EndOfLinePreference } from '../model';
import { BareFontInfo } from '../config/fontInfo';
import { Position } from '../core/position';
import { Selection } from '../core/selection';
import { HorizontalRange, Range } from '../core/range';
import { IKeyboardEvent } from '@fin/keyboard';

export interface ITextAreaHandlerHelper {
  visibleRangeForPositionRelativeToEditor(lineNumber: number, column: number): HorizontalRange | null;
}

class VisibleTextAreaData {
  public readonly top: number;
  public readonly left: number;
  public readonly width: number;

  constructor(top: number, left: number, width: number) {
    this.top = top;
    this.left = left;
    this.width = width;
  }

  public setWidth(width: number): VisibleTextAreaData {
    return new VisibleTextAreaData(this.top, this.left, width);
  }
}

const canUseZeroSizeTextarea = (isEdgeOrIE || isFirefox);

export class TextAreaHandler extends Disposable {

  private readonly _viewHelper: ITextAreaHandlerHelper;
  private _contentLeft: number;
  private _contentWidth: number;
  private _contentHeight: number;
  private _scrollLeft: number;
  private _scrollTop: number;
  private _fontInfo: BareFontInfo;
  private _lineHeight: number;
  private _emptySelectionClipboard: boolean;
  private _copyWithSyntaxHighlighting: boolean;

  /**
   * Defined only when the text area is visible (composition case).
   */
  private _visibleTextArea: VisibleTextAreaData | null;
  private _selections: Selection[];

  public readonly textArea: FastDomNode<HTMLTextAreaElement>;
  public readonly textAreaCover: FastDomNode<HTMLElement>;
  private readonly _textAreaInput: TextAreaInput;

  constructor(viewHelper: ITextAreaHandlerHelper) {
    super();
    this._viewHelper = viewHelper;

    const conf = this._context.configuration.editor;

    this._contentLeft = conf.layoutInfo.contentLeft;
    this._contentWidth = conf.layoutInfo.contentWidth;
    this._contentHeight = conf.layoutInfo.contentHeight;
    this._scrollLeft = 0;
    this._scrollTop = 0;
    this._fontInfo = conf.fontInfo;
    this._lineHeight = conf.lineHeight;
    this._emptySelectionClipboard = conf.emptySelectionClipboard;
    this._copyWithSyntaxHighlighting = conf.copyWithSyntaxHighlighting;

    this._visibleTextArea = null;
    this._selections = [new Selection(1, 1, 1, 1)];

    // Text Area (The focus will always be in the textarea when the cursor is blinking)
    this.textArea = createFastDomNode(document.createElement('textarea'));
    this.textArea.setClassName('inputarea');
    this.textArea.setAttribute('wrap', 'off');
    this.textArea.setAttribute('autocorrect', 'off');
    this.textArea.setAttribute('autocapitalize', 'off');
    this.textArea.setAttribute('autocomplete', 'off');
    this.textArea.setAttribute('spellcheck', 'false');
    this.textArea.setAttribute('aria-label', conf.viewInfo.ariaLabel);
    this.textArea.setAttribute('role', 'textbox');
    this.textArea.setAttribute('aria-multiline', 'true');
    this.textArea.setAttribute('aria-haspopup', 'false');
    this.textArea.setAttribute('aria-autocomplete', 'both');

    this.textAreaCover = createFastDomNode(document.createElement('div'));
    this.textAreaCover.setPosition('absolute');

    const simpleModel: ISimpleModel = {
      getLineCount: (): number => {
        // return this._context.model.getLineCount();
        return 0;
      },
      getLineMaxColumn: (lineNumber: number): number => {
        // return this._context.model.getLineMaxColumn(lineNumber);
        return 0;
      },
      getValueInRange: (range: Range, eol: EndOfLinePreference): string => {
        // return this._context.model.getValueInRange(range, eol);
        return '';
      }
    };

    const textAreaInputHost: ITextAreaInputHost = {
      getPlainTextToCopy: (): string => {
        // const rawWhatToCopy = this._context.model.getPlainTextToCopy(this._selections, this._emptySelectionClipboard, isWindows);
        // const newLineCharacter = this._context.model.getEOL();
        //
        // return (Array.isArray(rawWhatToCopy) ? rawWhatToCopy.join(newLineCharacter) : rawWhatToCopy);

        return null;
      },

      getHTMLToCopy: (): string | null => {
        // TODO: 连同格式复制
        return null;
      },

      getScreenReaderContent: (currentState: TextAreaState): TextAreaState => {
        return TextAreaState.EMPTY;
      },

      deduceModelPosition: (viewAnchorPosition: Position, deltaOffset: number, lineFeedCnt: number): Position => {
        return this._context.model.deduceModelPositionRelativeToViewPosition(viewAnchorPosition, deltaOffset, lineFeedCnt);
      }
    };

    this._textAreaInput = this._register(new TextAreaInput(textAreaInputHost, this.textArea));

    this._register(this._textAreaInput.onKeyDown((e: IKeyboardEvent) => {
      // this._viewController.emitKeyDown(e);
    }));

    this._register(this._textAreaInput.onKeyUp((e: IKeyboardEvent) => {
      // this._viewController.emitKeyUp(e);
    }));

    this._register(this._textAreaInput.onPaste((e: IPasteData) => {
      //
      // let pasteOnNewLine = false;
      // let multicursorText: string[] | null = null;
      // if (metadata) {
      //   pasteOnNewLine = (this._emptySelectionClipboard && metadata.isFromEmptySelection);
      //   multicursorText = metadata.multicursorText;
      // }
      // this._viewController.paste('keyboard', e.text, pasteOnNewLine, multicursorText);
    }));

    this._register(this._textAreaInput.onCut(() => {
      // this._viewController.cut('keyboard');
    }));

    this._register(this._textAreaInput.onType((e: ITypeData) => {
      // if (e.replaceCharCnt) {
      //   this._viewController.replacePreviousChar('keyboard', e.text, e.replaceCharCnt);
      // } else {
      //   this._viewController.type('keyboard', e.text);
      // }
    }));

    this._register(this._textAreaInput.onSelectionChangeRequest((modelSelection: Selection) => {
      // this._viewController.setSelection('keyboard', modelSelection);
    }));
    /*
    this._register(this._textAreaInput.onCompositionStart(() => {
      const lineNumber = this._selections[0].startLineNumber;
      const column = this._selections[0].startColumn;

      this._context.privateViewEventBus.emit(new viewEvents.ViewRevealRangeRequestEvent(
        new Range(lineNumber, column, lineNumber, column),
        viewEvents.VerticalRevealType.Simple,
        true,
        ScrollType.Immediate
      ));

      // Find range pixel position
      const visibleRange = this._viewHelper.visibleRangeForPositionRelativeToEditor(lineNumber, column);

      if (visibleRange) {
        this._visibleTextArea = new VisibleTextAreaData(
          this._context.viewLayout.getVerticalOffsetForLineNumber(lineNumber),
          visibleRange.left,
          canUseZeroSizeTextarea ? 0 : 1
        );
        this._render();
      }

      // Show the textarea
      this.textArea.setClassName('inputarea ime-input');

      this._viewController.compositionStart('keyboard');
    }));

    this._register(this._textAreaInput.onCompositionUpdate((e: ICompositionData) => {
      if (isEdgeOrIE) {
        // Due to isEdgeOrIE (where the textarea was not cleared initially)
        // we cannot assume the text consists only of the composited text
        this._visibleTextArea = this._visibleTextArea!.setWidth(0);
      } else {
        // adjust width by its size
        this._visibleTextArea = this._visibleTextArea!.setWidth(measureText(e.data, this._fontInfo));
      }
      this._render();
    }));
    */

    this._register(this._textAreaInput.onCompositionEnd(() => {

      // this._visibleTextArea = null;
      // this._render();
      //
      // this.textArea.setClassName('inputarea');
      // this._viewController.compositionEnd('keyboard');
    }));

    this._register(this._textAreaInput.onFocus(() => {
      // this._context.privateViewEventBus.emit(new viewEvents.ViewFocusChangedEvent(true));
    }));

    this._register(this._textAreaInput.onBlur(() => {
      // this._context.privateViewEventBus.emit(new viewEvents.ViewFocusChangedEvent(false));
    }));
  }

  public dispose(): void {
    super.dispose();
  }
  // --- begin view API

  public isFocused(): boolean {
    return this._textAreaInput.isFocused();
  }

  public focusTextArea(): void {
    this._textAreaInput.focusTextArea();
  }

  // --- end view API

  private _primaryCursorVisibleRange: HorizontalRange | null = null;

  public prepareRender(ctx: RenderingContext): void {
    const primaryCursorPosition = new Position(this._selections[0].positionLineNumber, this._selections[0].positionColumn);
    this._primaryCursorVisibleRange = ctx.visibleRangeForPosition(primaryCursorPosition);
  }

  public render(ctx: RestrictedRenderingContext): void {
    // this._textAreaInput.writeScreenReaderContent('render');
    this._render();
  }

  private _render(): void {
    if (this._visibleTextArea) {
      // The text area is visible for composition reasons
      this._renderInsideEditor(
        this._visibleTextArea.top - this._scrollTop,
        this._contentLeft + this._visibleTextArea.left - this._scrollLeft,
        this._visibleTextArea.width,
        this._lineHeight,
        true
      );
      return;
    }

    if (!this._primaryCursorVisibleRange) {
      // The primary cursor is outside the viewport => place textarea to the top left
      this._renderAtTopLeft();
      return;
    }

    const left = this._contentLeft + this._primaryCursorVisibleRange.left - this._scrollLeft;
    if (left < this._contentLeft || left > this._contentLeft + this._contentWidth) {
      // cursor is outside the viewport
      this._renderAtTopLeft();
      return;
    }

    const top = this._context.viewLayout.getVerticalOffsetForLineNumber(this._selections[0].positionLineNumber) - this._scrollTop;
    if (top < 0 || top > this._contentHeight) {
      // cursor is outside the viewport
      this._renderAtTopLeft();
      return;
    }

    // The primary cursor is in the viewport (at least vertically) => place textarea on the cursor
    this._renderInsideEditor(
      top, left,
      canUseZeroSizeTextarea ? 0 : 1, canUseZeroSizeTextarea ? 0 : 1,
      false
    );
  }

  private _renderInsideEditor(top: number, left: number, width: number, height: number, useEditorFont: boolean): void {
    const ta = this.textArea;
    const tac = this.textAreaCover;

    if (useEditorFont) {
      Configuration.applyFontInfo(ta, this._fontInfo);
    } else {
      ta.setFontSize(1);
      ta.setLineHeight(this._fontInfo.lineHeight);
    }

    ta.setTop(top);
    ta.setLeft(left);
    ta.setWidth(width);
    ta.setHeight(height);

    tac.setTop(0);
    tac.setLeft(0);
    tac.setWidth(0);
    tac.setHeight(0);
  }

  private _renderAtTopLeft(): void {
    const ta = this.textArea;
    const tac = this.textAreaCover;

    Configuration.applyFontInfo(ta, this._fontInfo);
    ta.setTop(0);
    ta.setLeft(0);
    tac.setTop(0);
    tac.setLeft(0);

    if (canUseZeroSizeTextarea) {
      ta.setWidth(0);
      ta.setHeight(0);
      tac.setWidth(0);
      tac.setHeight(0);
      return;
    }

    // (in WebKit the textarea is 1px by 1px because it cannot handle input to a 0x0 textarea)
    // specifically, when doing Korean IME, setting the textarea to 0x0 breaks IME badly.

    ta.setWidth(1);
    ta.setHeight(1);
    tac.setWidth(1);
    tac.setHeight(1);

    // FIXME
    // if (this._context.configuration.editor.viewInfo.glyphMargin) {
    //   tac.setClassName('monaco-editor-background textAreaCover ' + Margin.OUTER_CLASS_NAME);
    // } else {
    //   if (this._context.configuration.editor.viewInfo.renderLineNumbers !== RenderLineNumbersType.Off) {
    //     tac.setClassName('monaco-editor-background textAreaCover ' + LineNumbersOverlay.CLASS_NAME);
    //   } else {
    //     tac.setClassName('monaco-editor-background textAreaCover');
    //   }
    // }
  }
}

function measureText(text: string, fontInfo: BareFontInfo): number {
  // adjust width by its size
  const canvasElem = <HTMLCanvasElement>document.createElement('canvas');
  const context = canvasElem.getContext('2d')!;
  context.font = createFontString(fontInfo);
  const metrics = context.measureText(text);

  if (isFirefox) {
    return metrics.width + 2; // +2 for Japanese...
  } else {
    return metrics.width;
  }
}

function createFontString(bareFontInfo: BareFontInfo): string {
  return doCreateFontString('normal', bareFontInfo.fontWeight, bareFontInfo.fontSize, bareFontInfo.lineHeight, bareFontInfo.fontFamily);
}

function doCreateFontString(fontStyle: string, fontWeight: string, fontSize: number, lineHeight: number, fontFamily: string): string {
  // The full font syntax is:
  // style | variant | weight | stretch | size/line-height | fontFamily
  // (https://developer.mozilla.org/en-US/docs/Web/CSS/font)
  // But it appears Edge and IE11 cannot properly parse `stretch`.
  return `${fontStyle} normal ${fontWeight} ${fontSize}px / ${lineHeight}px ${fontFamily}`;
}
