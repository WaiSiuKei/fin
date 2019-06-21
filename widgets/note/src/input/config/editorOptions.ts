/**
 * @internal
 */
import { FontInfo } from './fontInfo';

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

/**
 * Internal configuration options (transformed or computed) for the editor.
 */
export class InternalEditorOptions {

  // ---- grouped options
  lineHeight: number;
  fontInfo?: FontInfo;
  layoutInfo: EditorLayoutInfo;
  /**
   * @internal
   */
  constructor(source: {
    lineHeight: number,
    fontInfo?: FontInfo,
    layoutInfo: EditorLayoutInfo,
  }) {
    this.lineHeight = source.lineHeight;
    this.fontInfo = source.fontInfo;
    this.layoutInfo = source.layoutInfo;
  }
}
