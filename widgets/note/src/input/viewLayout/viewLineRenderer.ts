import { CharCode } from '@fin/charcode';
import { IStringBuilder } from '@fin/string-builder';

class LinePart {
  _linePartBrand: void;

  /**
   * last char index of this token (not inclusive).
   */
  public readonly endIndex: number;
  public readonly type: string;

  constructor(endIndex: number, type: string) {
    this.endIndex = endIndex;
    this.type = type;
  }
}

export const enum CharacterMappingConstants {
  PART_INDEX_MASK = 0b11111111111111110000000000000000,
  CHAR_INDEX_MASK = 0b00000000000000001111111111111111,

  CHAR_INDEX_OFFSET = 0,
  PART_INDEX_OFFSET = 16
}

/**
 * Provides a both direction mapping between a line's character and its rendered position.
 */
export class CharacterMapping {

  public static getPartIndex(partData: number): number {
    return (partData & CharacterMappingConstants.PART_INDEX_MASK) >>> CharacterMappingConstants.PART_INDEX_OFFSET;
  }

  public static getCharIndex(partData: number): number {
    return (partData & CharacterMappingConstants.CHAR_INDEX_MASK) >>> CharacterMappingConstants.CHAR_INDEX_OFFSET;
  }

  public readonly length: number;
  private readonly _data: Uint32Array;
  private readonly _absoluteOffsets: Uint32Array;

  constructor(length: number, partCount: number) {
    this.length = length;
    this._data = new Uint32Array(this.length);
    this._absoluteOffsets = new Uint32Array(this.length);
  }

  public setPartData(charOffset: number, partIndex: number, charIndex: number, partAbsoluteOffset: number): void {
    let partData = (
      (partIndex << CharacterMappingConstants.PART_INDEX_OFFSET)
      | (charIndex << CharacterMappingConstants.CHAR_INDEX_OFFSET)
    ) >>> 0;
    this._data[charOffset] = partData;
    this._absoluteOffsets[charOffset] = partAbsoluteOffset + charIndex;
  }

  public getAbsoluteOffsets(): Uint32Array {
    return this._absoluteOffsets;
  }

  public charOffsetToPartData(charOffset: number): number {
    if (this.length === 0) {
      return 0;
    }
    if (charOffset < 0) {
      return this._data[0];
    }
    if (charOffset >= this.length) {
      return this._data[this.length - 1];
    }
    return this._data[charOffset];
  }

  public partDataToCharOffset(partIndex: number, partLength: number, charIndex: number): number {
    if (this.length === 0) {
      return 0;
    }

    let searchEntry = (
      (partIndex << CharacterMappingConstants.PART_INDEX_OFFSET)
      | (charIndex << CharacterMappingConstants.CHAR_INDEX_OFFSET)
    ) >>> 0;

    let min = 0;
    let max = this.length - 1;
    while (min + 1 < max) {
      let mid = ((min + max) >>> 1);
      let midEntry = this._data[mid];
      if (midEntry === searchEntry) {
        return mid;
      } else if (midEntry > searchEntry) {
        max = mid;
      } else {
        min = mid;
      }
    }

    if (min === max) {
      return min;
    }

    let minEntry = this._data[min];
    let maxEntry = this._data[max];

    if (minEntry === searchEntry) {
      return min;
    }
    if (maxEntry === searchEntry) {
      return max;
    }

    let minPartIndex = CharacterMapping.getPartIndex(minEntry);
    let minCharIndex = CharacterMapping.getCharIndex(minEntry);

    let maxPartIndex = CharacterMapping.getPartIndex(maxEntry);
    let maxCharIndex: number;

    if (minPartIndex !== maxPartIndex) {
      // sitting between parts
      maxCharIndex = partLength;
    } else {
      maxCharIndex = CharacterMapping.getCharIndex(maxEntry);
    }

    let minEntryDistance = charIndex - minCharIndex;
    let maxEntryDistance = maxCharIndex - charIndex;

    if (minEntryDistance <= maxEntryDistance) {
      return min;
    }
    return max;
  }
}

export class RenderLineInput {

  public readonly lineContent: string;
  public readonly mightContainRTL: boolean;
  public readonly fauxIndentLength: number;
  public readonly spaceWidth: number;
  public readonly stopRenderingLineAfter: number;

  constructor(
    lineContent: string,
    mightContainRTL: boolean,
    fauxIndentLength: number,
    spaceWidth: number,
    stopRenderingLineAfter: number,
    // renderWhitespace: 'none' | 'boundary' | 'all',
  ) {
    this.lineContent = lineContent;
    this.mightContainRTL = mightContainRTL;
    this.fauxIndentLength = fauxIndentLength;
    this.spaceWidth = spaceWidth;
    this.stopRenderingLineAfter = stopRenderingLineAfter;
  }

  public equals(other: RenderLineInput): boolean {
    return (
      this.lineContent === other.lineContent
      && this.mightContainRTL === other.mightContainRTL
      && this.fauxIndentLength === other.fauxIndentLength
      && this.spaceWidth === other.spaceWidth
      && this.stopRenderingLineAfter === other.stopRenderingLineAfter
    );
  }
}

export class RenderLineOutput {
  _renderLineOutputBrand: void;

  readonly characterMapping: CharacterMapping;
  readonly containsRTL: boolean;
  readonly containsForeignElements: boolean;

  constructor(characterMapping: CharacterMapping, containsRTL: boolean, containsForeignElements: boolean) {
    this.characterMapping = characterMapping;
    this.containsRTL = containsRTL;
    this.containsForeignElements = containsForeignElements;
  }
}

export function renderViewLine(input: RenderLineInput, sb: IStringBuilder): RenderLineOutput {
  if (input.lineContent.length === 0) {

    let containsForeignElements = false;

    // This is basically for IE's hit test to work
    let content: string = '<span><span>\u00a0</span></span>';

    // if (input.lineDecorations.length > 0) {
    //   // This line is empty, but it contains inline decorations
    //   let classNames: string[] = [];
    //   for (let i = 0, len = input.lineDecorations.length; i < len; i++) {
    //     const lineDecoration = input.lineDecorations[i];
    //     if (lineDecoration.type !== InlineDecorationType.Regular) {
    //       classNames.push(input.lineDecorations[i].className);
    //       containsForeignElements = true;
    //     }
    //   }
    //
    //   if (containsForeignElements) {
    //     content = `<span><span class="${classNames.join(' ')}"></span></span>`;
    //   }
    // }

    sb.appendASCIIString(content);
    return new RenderLineOutput(
      new CharacterMapping(0, 0),
      false,
      containsForeignElements
    );
  }

  return _renderLine(resolveRenderLineInput(input), sb);
}

class ResolvedRenderLineInput {
  constructor(
    public readonly lineContent: string,
    public readonly len: number,
    public readonly isOverflowing: boolean,
    public readonly parts: LinePart[],
    public readonly containsForeignElements: boolean,
    public readonly containsRTL: boolean,
    public readonly spaceWidth: number,
  ) {
    //
  }
}

function resolveRenderLineInput(input: RenderLineInput): ResolvedRenderLineInput {
  const lineContent = input.lineContent;

  let isOverflowing: boolean;
  let len: number;

  if (input.stopRenderingLineAfter !== -1 && input.stopRenderingLineAfter < lineContent.length) {
    isOverflowing = true;
    len = input.stopRenderingLineAfter;
  } else {
    isOverflowing = false;
    len = lineContent.length;
  }

  let containsForeignElements = false;
  let containsRTL = false;

  return new ResolvedRenderLineInput(
    lineContent,
    len,
    isOverflowing,
    [],
    containsForeignElements,
    containsRTL,
    input.spaceWidth,
  );
}

/**
 * This function is on purpose not split up into multiple functions to allow runtime type inference (i.e. performance reasons).
 * Notice how all the needed data is fully resolved and passed in (i.e. no other calls).
 */
function _renderLine(input: ResolvedRenderLineInput, sb: IStringBuilder): RenderLineOutput {
  const containsForeignElements = input.containsForeignElements;
  const lineContent = input.lineContent;
  const len = input.len;
  const isOverflowing = input.isOverflowing;
  const parts = input.parts;
  const containsRTL = input.containsRTL;
  const spaceWidth = input.spaceWidth;
  const tabSize = 4; // FIXME

  const characterMapping = new CharacterMapping(len + 1, parts.length);

  let charIndex = 0;
  let tabsCharDelta = 0;
  let charOffsetInPart = 0;

  let prevPartContentCnt = 0;
  let partAbsoluteOffset = 0;

  sb.appendASCIIString('<span>');

  for (let partIndex = 0, tokensLen = parts.length; partIndex < tokensLen; partIndex++) {
    partAbsoluteOffset += prevPartContentCnt;

    const part = parts[partIndex];
    const partEndIndex = part.endIndex;
    const partType = part.type;
    const partRendersWhitespace = false;
    charOffsetInPart = 0;

    sb.appendASCIIString('<span class="');
    sb.appendASCIIString(partType);
    sb.appendASCII(CharCode.DoubleQuote);

    if (partRendersWhitespace) {

      let partContentCnt = 0;
      {
        let _charIndex = charIndex;
        let _tabsCharDelta = tabsCharDelta;

        for (; _charIndex < partEndIndex; _charIndex++) {
          const charCode = lineContent.charCodeAt(_charIndex);

          if (charCode === CharCode.Tab) {
            let insertSpacesCount = tabSize - (_charIndex + _tabsCharDelta) % tabSize;
            _tabsCharDelta += insertSpacesCount - 1;
            partContentCnt += insertSpacesCount;
          } else {
            partContentCnt++;
          }
        }
      }

      sb.appendASCII(CharCode.GreaterThan);

      for (; charIndex < partEndIndex; charIndex++) {
        characterMapping.setPartData(charIndex, partIndex, charOffsetInPart, partAbsoluteOffset);
        const charCode = lineContent.charCodeAt(charIndex);

        if (charCode === CharCode.Tab) {
          let insertSpacesCount = tabSize - (charIndex + tabsCharDelta) % tabSize;
          tabsCharDelta += insertSpacesCount - 1;
          charOffsetInPart += insertSpacesCount - 1;
          if (insertSpacesCount > 0) {
            sb.write1(0x2192); // &rarr;
            insertSpacesCount--;
          }
          while (insertSpacesCount > 0) {
            sb.write1(0xA0); // &nbsp;
            insertSpacesCount--;
          }
        } else {
          // must be CharCode.Space
          sb.write1(0xb7); // &middot;
        }

        charOffsetInPart++;
      }

      prevPartContentCnt = partContentCnt;

    } else {

      let partContentCnt = 0;

      if (containsRTL) {
        sb.appendASCIIString(' dir="ltr"');
      }
      sb.appendASCII(CharCode.GreaterThan);

      for (; charIndex < partEndIndex; charIndex++) {
        characterMapping.setPartData(charIndex, partIndex, charOffsetInPart, partAbsoluteOffset);
        const charCode = lineContent.charCodeAt(charIndex);

        switch (charCode) {
          case CharCode.Tab:
            let insertSpacesCount = tabSize - (charIndex + tabsCharDelta) % tabSize;
            tabsCharDelta += insertSpacesCount - 1;
            charOffsetInPart += insertSpacesCount - 1;
            while (insertSpacesCount > 0) {
              sb.write1(0xA0); // &nbsp;
              partContentCnt++;
              insertSpacesCount--;
            }
            break;

          case CharCode.Space:
            sb.write1(0xA0); // &nbsp;
            partContentCnt++;
            break;

          case CharCode.LessThan:
            sb.appendASCIIString('&lt;');
            partContentCnt++;
            break;

          case CharCode.GreaterThan:
            sb.appendASCIIString('&gt;');
            partContentCnt++;
            break;

          case CharCode.Ampersand:
            sb.appendASCIIString('&amp;');
            partContentCnt++;
            break;

          case CharCode.Null:
            sb.appendASCIIString('&#00;');
            partContentCnt++;
            break;

          case CharCode.UTF8_BOM:
          case CharCode.LINE_SEPARATOR_2028:
            sb.write1(0xfffd);
            partContentCnt++;
            break;

          default:
            sb.write1(charCode);
            partContentCnt++;
        }

        charOffsetInPart++;
      }

      prevPartContentCnt = partContentCnt;
    }

    sb.appendASCIIString('</span>');

  }

  // When getting client rects for the last character, we will position the
  // text range at the end of the span, insteaf of at the beginning of next span
  characterMapping.setPartData(len, parts.length - 1, charOffsetInPart, partAbsoluteOffset);

  if (isOverflowing) {
    sb.appendASCIIString('<span>&hellip;</span>');
  }

  sb.appendASCIIString('</span>');

  return new RenderLineOutput(characterMapping, containsRTL, containsForeignElements);
}
