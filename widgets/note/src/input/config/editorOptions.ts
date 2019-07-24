/**
 * @internal
 */
import { FontInfo } from './fontInfo';
import { ScrollbarVisibility } from '@fin/scrollbar';

export const INPUT_FONT_DEFAULTS = {
  fontFamily: (
    '\'Helvetica Neue\', Helvetica, Arial, \'Lantinghei SC\', \'Hiragino Sans GB\', \'Microsoft Yahei\', sans-serif;'
  ),
  fontWeight: 'normal',
  fontSize: 14,
  lineHeight: 0,
  letterSpacing: 0,
};

/**
 * Configuration options for the editor.
 */
export interface IEditorOptions {
}

/**
 * The internal layout details of the editor.
 */
export interface EditorLayoutInfo {

  /**
   * Full editor width.
   */
  readonly width: number;
  /**
   * Full editor height.
   */
  readonly height: number;
  /**
   * Left position for the content (actual text)
   */
  readonly contentLeft: number;
  /**
   * The width of the content (actual text)
   */
  readonly contentWidth: number;
  /**
   * The height of the content (actual height)
   */
  readonly contentHeight: number;

}

export interface InternalEditorScrollbarOptions {
  readonly arrowSize: number;
  readonly vertical: ScrollbarVisibility;
  readonly horizontal: ScrollbarVisibility;
  readonly useShadows: boolean;
  readonly verticalHasArrows: boolean;
  readonly horizontalHasArrows: boolean;
  readonly handleMouseWheel: boolean;
  readonly horizontalScrollbarSize: number;
  readonly horizontalSliderSize: number;
  readonly verticalScrollbarSize: number;
  readonly verticalSliderSize: number;
  readonly mouseWheelScrollSensitivity: number;
}


export interface InternalEditorViewOptions {
  readonly stopRenderingLineAfter: number;
  readonly renderWhitespace: 'none' | 'boundary' | 'all';
  readonly scrollbar: InternalEditorScrollbarOptions;
}

/**
 * Internal configuration options (transformed or computed) for the editor.
 */
export class InternalEditorOptions {

  // ---- grouped options
  lineHeight: number;
  readonly layoutInfo: EditorLayoutInfo;
  readonly fontInfo: FontInfo;
  readonly viewInfo: InternalEditorViewOptions;

  constructor(source: {
    lineHeight: number,
    fontInfo: FontInfo,
    layoutInfo: EditorLayoutInfo,
    viewInfo: InternalEditorViewOptions;
  }) {
    this.lineHeight = source.lineHeight;
    this.fontInfo = source.fontInfo;
    this.layoutInfo = source.layoutInfo;
    this.viewInfo = source.viewInfo;
  }
}
