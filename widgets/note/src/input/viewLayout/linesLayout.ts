/**
 * Layouting of objects that take vertical space (by having a height) and push down other objects.
 *
 * These objects are basically either text (lines) or spaces between those lines (whitespaces).
 * This provides commodity operations for working with lines that contain whitespace that pushes lines lower (vertically).
 * This is written with no knowledge of an editor in mind.
 */
import { IPartialViewLinesViewportData } from './viewLinesViewportData';

export class LinesLayout {

  /**
   * Keep track of the total number of lines.
   * This is useful for doing binary searches or for doing hit-testing.
   */
  private _lineCount: number;

  /**
   * The height of a line in pixels.
   */
  private _lineHeight: number;

  /**
   * Contains whitespace information in pixels
   */
  // private _whitespaces: WhitespaceComputer;

  constructor(lineCount: number, lineHeight: number) {
    this._lineCount = lineCount;
    this._lineHeight = lineHeight;
    // this._whitespaces = new WhitespaceComputer();
  }

  /**
   * Change the height of a line in pixels.
   */
  public setLineHeight(lineHeight: number): void {
    this._lineHeight = lineHeight;
  }

  /**
   * Set the number of lines.
   *
   * @param lineCount New number of lines.
   */
  public onFlushed(lineCount: number): void {
    this._lineCount = lineCount;
  }

  /**
   * Insert a new whitespace of a certain height after a line number.
   * The whitespace has a "sticky" characteristic.
   * Irrespective of edits above or below `afterLineNumber`, the whitespace will follow the initial line.
   *
   * @param afterLineNumber The conceptual position of this whitespace. The whitespace will follow this line as best as possible even when deleting/inserting lines above/below.
   * @param heightInPx The height of the whitespace, in pixels.
   * @return An id that can be used later to mutate or delete the whitespace
   */
  // public insertWhitespace(afterLineNumber: number, ordinal: number, heightInPx: number): number {
  //   return this._whitespaces.insertWhitespace(afterLineNumber, ordinal, heightInPx);
  // }

  /**
   * Change properties associated with a certain whitespace.
   */
  // public changeWhitespace(id: number, newAfterLineNumber: number, newHeight: number): boolean {
  //   return this._whitespaces.changeWhitespace(id, newAfterLineNumber, newHeight);
  // }

  /**
   * Remove an existing whitespace.
   *
   * @param id The whitespace to remove
   * @return Returns true if the whitespace is found and it is removed.
   */
  // public removeWhitespace(id: number): boolean {
  //   return this._whitespaces.removeWhitespace(id);
  // }

  /**
   * Notify the layouter that lines have been deleted (a continuous zone of lines).
   *
   * @param fromLineNumber The line number at which the deletion started, inclusive
   * @param toLineNumber The line number at which the deletion ended, inclusive
   */
  public onLinesDeleted(fromLineNumber: number, toLineNumber: number): void {
    this._lineCount -= (toLineNumber - fromLineNumber + 1);
    // this._whitespaces.onLinesDeleted(fromLineNumber, toLineNumber);
  }

  /**
   * Notify the layouter that lines have been inserted (a continuous zone of lines).
   *
   * @param fromLineNumber The line number at which the insertion started, inclusive
   * @param toLineNumber The line number at which the insertion ended, inclusive.
   */
  public onLinesInserted(fromLineNumber: number, toLineNumber: number): void {
    this._lineCount += (toLineNumber - fromLineNumber + 1);
    // this._whitespaces.onLinesInserted(fromLineNumber, toLineNumber);
  }

  /**
   * Get the sum of heights for all objects.
   *
   * @return The sum of heights for all objects.
   */
  public getLinesTotalHeight(): number {
    let linesHeight = this._lineHeight * this._lineCount;
    return linesHeight;
    // let whitespacesHeight = this._whitespaces.getTotalHeight();
    // return linesHeight + whitespacesHeight;
  }

  /**
   * Get the vertical offset (the sum of heights for all objects above) a certain line number.
   *
   * @param lineNumber The line number
   * @return The sum of heights for all objects above `lineNumber`.
   */
  public getVerticalOffsetForLineNumber(lineNumber: number): number {
    lineNumber = lineNumber | 0;

    let previousLinesHeight: number;
    if (lineNumber > 1) {
      previousLinesHeight = this._lineHeight * (lineNumber - 1);
    } else {
      previousLinesHeight = 0;
    }

    return previousLinesHeight;
  }

  /**
   * Check if `verticalOffset` is below all lines.
   */
  public isAfterLines(verticalOffset: number): boolean {
    let totalHeight = this.getLinesTotalHeight();
    return verticalOffset > totalHeight;
  }

  /**
   * Find the first line number that is at or after vertical offset `verticalOffset`.
   * i.e. if getVerticalOffsetForLine(line) is x and getVerticalOffsetForLine(line + 1) is y, then
   * getLineNumberAtOrAfterVerticalOffset(i) = line, x <= i < y.
   *
   * @param verticalOffset The vertical offset to search at.
   * @return The line number at or after vertical offset `verticalOffset`.
   */
  public getLineNumberAtOrAfterVerticalOffset(verticalOffset: number): number {
    verticalOffset = verticalOffset | 0;

    if (verticalOffset <= 0) {
      return 1;
    }

    const linesCount = this._lineCount | 0;
    const lineHeight = this._lineHeight;
    let minLineNumber = 1;
    let maxLineNumber = linesCount;

    while (minLineNumber < maxLineNumber) {
      let midLineNumber = ((minLineNumber + maxLineNumber) / 2) | 0;

      let midLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(midLineNumber) | 0;

      if (verticalOffset >= midLineNumberVerticalOffset + lineHeight) {
        // vertical offset is after mid line number
        minLineNumber = midLineNumber + 1;
      } else if (verticalOffset >= midLineNumberVerticalOffset) {
        // Hit
        return midLineNumber;
      } else {
        // vertical offset is before mid line number, but mid line number could still be what we're searching for
        maxLineNumber = midLineNumber;
      }
    }

    if (minLineNumber > linesCount) {
      return linesCount;
    }

    return minLineNumber;
  }

  /**
   * Get all the lines and their relative vertical offsets that are positioned between `verticalOffset1` and `verticalOffset2`.
   *
   * @param verticalOffset1 The beginning of the viewport.
   * @param verticalOffset2 The end of the viewport.
   * @return A structure describing the lines positioned between `verticalOffset1` and `verticalOffset2`.
   */
  public getLinesViewportData(verticalOffset1: number, verticalOffset2: number): IPartialViewLinesViewportData {
    verticalOffset1 = verticalOffset1 | 0;
    verticalOffset2 = verticalOffset2 | 0;
    const lineHeight = this._lineHeight;

    // Find first line number
    // We don't live in a perfect world, so the line number might start before or after verticalOffset1
    const startLineNumber = this.getLineNumberAtOrAfterVerticalOffset(verticalOffset1) | 0;
    const startLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(startLineNumber) | 0;

    let endLineNumber = this._lineCount | 0;

    let currentVerticalOffset = startLineNumberVerticalOffset;
    let currentLineRelativeOffset = currentVerticalOffset;

    let bigNumbersDelta = 0;

    let linesOffsets: number[] = [];

    const verticalCenter = verticalOffset1 + (verticalOffset2 - verticalOffset1) / 2;
    let centeredLineNumber = -1;

    // Figure out how far the lines go
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {

      if (centeredLineNumber === -1) {
        let currentLineTop = currentVerticalOffset;
        let currentLineBottom = currentVerticalOffset + lineHeight;
        if ((currentLineTop <= verticalCenter && verticalCenter < currentLineBottom) || currentLineTop > verticalCenter) {
          centeredLineNumber = lineNumber;
        }
      }

      // Count current line height in the vertical offsets
      currentVerticalOffset += lineHeight;
      linesOffsets[lineNumber - startLineNumber] = currentLineRelativeOffset;

      // Next line starts immediately after this one
      currentLineRelativeOffset += lineHeight;

      if (currentVerticalOffset >= verticalOffset2) {
        // We have covered the entire viewport area, time to stop
        endLineNumber = lineNumber;
        break;
      }
    }

    if (centeredLineNumber === -1) {
      centeredLineNumber = endLineNumber;
    }

    const endLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(endLineNumber) | 0;

    let completelyVisibleStartLineNumber = startLineNumber;
    let completelyVisibleEndLineNumber = endLineNumber;

    if (completelyVisibleStartLineNumber < completelyVisibleEndLineNumber) {
      if (startLineNumberVerticalOffset < verticalOffset1) {
        completelyVisibleStartLineNumber++;
      }
    }
    if (completelyVisibleStartLineNumber < completelyVisibleEndLineNumber) {
      if (endLineNumberVerticalOffset + lineHeight > verticalOffset2) {
        completelyVisibleEndLineNumber--;
      }
    }

    return {
      bigNumbersDelta: bigNumbersDelta,
      startLineNumber: startLineNumber,
      endLineNumber: endLineNumber,
      relativeVerticalOffset: linesOffsets,
      centeredLineNumber: centeredLineNumber,
      completelyVisibleStartLineNumber: completelyVisibleStartLineNumber,
      completelyVisibleEndLineNumber: completelyVisibleEndLineNumber
    };
  }
}
